"use client";

import { useState } from "react";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Sender..." });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Takk for din melding! Vi tar kontakt snart.",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Noe gikk galt. Vennligst prøv igjen.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Kunne ikke sende melding. Vennligst prøv igjen.",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Message */}
      {status.type !== "idle" && (
        <div
          className={`rounded-lg p-4 ${
            status.type === "success"
              ? "bg-green-50 text-green-800"
              : status.type === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="mb-2 block font-semibold text-text-primary">
          Navn *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={100}
          className="border-border-default focus:ring-primary/20 w-full rounded-lg border bg-background-surface px-4 py-3 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2"
          placeholder="Ditt navn"
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="mb-2 block font-semibold text-text-primary">
          E-post *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border-border-default focus:ring-primary/20 w-full rounded-lg border bg-background-surface px-4 py-3 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2"
          placeholder="din@epost.no"
        />
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="mb-2 block font-semibold text-text-primary">
          Emne *
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="border-border-default focus:ring-primary/20 w-full rounded-lg border bg-background-surface px-4 py-3 text-text-primary focus:border-primary focus:outline-none focus:ring-2"
        >
          <option value="">Velg emne...</option>
          <option value="Generell henvendelse">Generell henvendelse</option>
          <option value="Legg til golfbane">Legg til golfbane</option>
          <option value="Oppdater baneinformasjon">Oppdater baneinformasjon</option>
          <option value="Teknisk support">Teknisk support</option>
          <option value="Annet">Annet</option>
        </select>
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="mb-2 block font-semibold text-text-primary">
          Melding *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          maxLength={5000}
          rows={6}
          className="border-border-default focus:ring-primary/20 w-full rounded-lg border bg-background-surface px-4 py-3 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2"
          placeholder="Skriv din melding her..."
        />
        <div className="mt-1 text-sm text-text-tertiary">{formData.message.length} / 5000 tegn</div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status.type === "loading"}
        className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status.type === "loading" ? "Sender..." : "Send melding"}
      </button>

      <p className="text-sm text-text-tertiary">
        * Alle felt er påkrevd. Vi svarer vanligvis innen 1-2 virkedager.
      </p>
    </form>
  );
}
