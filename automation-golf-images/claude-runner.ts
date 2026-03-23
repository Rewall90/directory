import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { createWriteStream, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import type { ImageResult } from "./types";

const TIMEOUT_MS = 600_000; // 10 minutes

/**
 * Spawn a Claude CLI subprocess with a prompt and return the parsed result.
 *
 * Uses `--output-format stream-json` to capture the FULL conversation.
 * Adapted from badstukart automation — identical subprocess wrapper,
 * only the result type differs (golf ImageResult instead of sauna ImageResult).
 */
export async function runClaude(
  prompt: string,
  slug: string,
  logDir: string,
): Promise<{
  result: ImageResult | null;
  raw: string;
  error: string | null;
  cost_usd: number;
  duration_ms: number;
}> {
  const sessionId = randomUUID();
  const startTime = Date.now();

  // Save the prompt we're sending
  mkdirSync(logDir, { recursive: true });
  writeFileSync(join(logDir, `${slug}-prompt.txt`), prompt, "utf-8");

  // Open a write stream for the raw ndjson
  const streamFile = createWriteStream(join(logDir, `${slug}-stream.jsonl`));

  return new Promise((resolve) => {
    // Build env without CLAUDECODE (allows nested Claude calls)
    const env = { ...process.env };
    delete env.CLAUDECODE;
    delete env.CLAUDE_CODE_ENTRYPOINT;

    const args = [
      "-p",
      "--session-id",
      sessionId,
      "--allowedTools",
      "Bash,Read,Glob,Grep",
      "--model",
      "sonnet",
      "--output-format",
      "stream-json",
      "--verbose",
    ];

    const child = spawn("claude", args, {
      env,
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let stderr = "";
    let stdoutBuffer = "";

    // Conversation state built from stream events
    const transcript: string[] = [];
    const textChunks: string[] = [];
    let currentToolName = "";
    let currentToolInput = "";
    let lastAssistantText = "";
    let costUsd = 0;
    let inputTokens = 0;
    let outputTokens = 0;

    child.stdout.on("data", (data: Buffer) => {
      const chunk = data.toString();
      stdoutBuffer += chunk;

      const lines = stdoutBuffer.split("\n");
      stdoutBuffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        streamFile.write(line + "\n");

        try {
          const event = JSON.parse(line);
          processStreamEvent(event, {
            transcript,
            textChunks,
            getCurrentToolName: () => currentToolName,
            setCurrentToolName: (n: string) => {
              currentToolName = n;
            },
            getCurrentToolInput: () => currentToolInput,
            setCurrentToolInput: (i: string) => {
              currentToolInput = i;
            },
            appendToolInput: (i: string) => {
              currentToolInput += i;
            },
            setLastAssistantText: (t: string) => {
              lastAssistantText = t;
            },
            addCost: (c: number) => {
              costUsd += c;
            },
            setTokens: (i: number, o: number) => {
              inputTokens += i;
              outputTokens += o;
            },
          });
        } catch {
          // Not valid JSON
        }
      }
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    // Send prompt via stdin
    child.stdin.write(prompt);
    child.stdin.end();

    function saveLogs() {
      try {
        if (stdoutBuffer.trim()) {
          streamFile.write(stdoutBuffer + "\n");
        }
        streamFile.end();

        writeFileSync(join(logDir, `${slug}-stderr.txt`), stderr, "utf-8");

        const header = [
          `=== Golf image scrape transcript for ${slug} ===`,
          `Session: ${sessionId}`,
          `Started: ${new Date(startTime).toISOString()}`,
          `Duration: ${Math.round((Date.now() - startTime) / 1000)}s`,
          `Cost: $${costUsd.toFixed(4)}`,
          `Tokens: ${inputTokens} in / ${outputTokens} out`,
          "",
          "---",
          "",
        ];
        writeFileSync(
          join(logDir, `${slug}-transcript.txt`),
          header.concat(transcript).join("\n"),
          "utf-8",
        );
      } catch {
        // Best effort
      }
    }

    // Timeout
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      transcript.push("\n[TIMEOUT after 600s]");
      saveLogs();
      resolve({
        result: null,
        raw: lastAssistantText,
        error: `Timeout after ${TIMEOUT_MS / 1000}s`,
        cost_usd: costUsd,
        duration_ms: TIMEOUT_MS,
      });
    }, TIMEOUT_MS);

    child.on("close", (code) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;

      if (code !== 0 && !lastAssistantText) {
        transcript.push(`\n[EXIT CODE ${code}]`);
        saveLogs();
        resolve({
          result: null,
          raw: stderr,
          error: `Claude exited with code ${code}: ${stderr.slice(0, 500)}`,
          cost_usd: costUsd,
          duration_ms: duration,
        });
        return;
      }

      saveLogs();

      const imageResult = extractJsonFromText(lastAssistantText);

      resolve({
        result: imageResult,
        raw: lastAssistantText,
        error: imageResult ? null : "Could not extract JSON from response",
        cost_usd: costUsd,
        duration_ms: duration,
      });
    });
  });
}

// --- Stream event processing ---

interface StreamState {
  transcript: string[];
  textChunks: string[];
  getCurrentToolName: () => string;
  setCurrentToolName: (n: string) => void;
  getCurrentToolInput: () => string;
  setCurrentToolInput: (i: string) => void;
  appendToolInput: (i: string) => void;
  setLastAssistantText: (t: string) => void;
  addCost: (c: number) => void;
  setTokens: (i: number, o: number) => void;
}

function processStreamEvent(event: any, state: StreamState) {
  if (event.type === "result") {
    if (event.total_cost_usd) state.addCost(event.total_cost_usd);
    else if (event.cost_usd) state.addCost(event.cost_usd);
    if (event.result) state.setLastAssistantText(event.result);
    return;
  }

  if (event.type === "assistant") {
    if (event.message?.content) {
      for (const block of event.message.content) {
        if (block.type === "text") {
          state.transcript.push(`\n[ASSISTANT]\n${block.text}\n`);
          state.setLastAssistantText(block.text);
        } else if (block.type === "tool_use") {
          const inputStr =
            typeof block.input === "string" ? block.input : JSON.stringify(block.input, null, 2);
          state.transcript.push(`\n[TOOL CALL: ${block.name}]\n${truncate(inputStr, 2000)}\n`);
        }
      }
    }
    if (event.message?.usage) {
      state.setTokens(
        event.message.usage.input_tokens || 0,
        event.message.usage.output_tokens || 0,
      );
    }
    return;
  }

  if (event.type === "user" && event.message?.content) {
    for (const block of event.message.content) {
      if (block.type === "tool_result") {
        let text = "";
        if (event.tool_use_result?.stdout) {
          text = event.tool_use_result.stdout;
        } else if (typeof block.content === "string") {
          text = block.content;
        } else if (Array.isArray(block.content)) {
          text = block.content.map((c: any) => c.text || "").join("\n");
        }
        state.transcript.push(`\n[TOOL RESULT]\n${truncate(text, 3000)}\n`);
      }
    }
    return;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + `\n... [truncated, ${text.length} chars total]`;
}

/**
 * Extract an ImageResult JSON object from free-form text.
 */
function extractJsonFromText(text: string): ImageResult | null {
  // Try markdown fences
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]) as ImageResult;
    } catch {
      // Fall through
    }
  }

  // Try raw JSON with courseSlug key
  const jsonMatch = text.match(/\{[\s\S]*?"courseSlug"[\s\S]*?\n\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as ImageResult;
    } catch {
      // Fall through
    }
  }

  // Try entire text
  try {
    return JSON.parse(text) as ImageResult;
  } catch {
    return null;
  }
}
