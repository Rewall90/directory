# Applied title + meta overrides — tier 1 (golfkart.no, 2026-06)

All entries use the new `seo_title` / `seo_description` JSON fields read by `generateMetadata` in `src/app/[locale]/[region]/[course]/page.tsx`. Untouched courses fall through to the existing template.

```
/rogaland/sola-golfklubb
  TITLE  (45): Sola Golfklubb — 18 hull, greenfee fra 700 kr
  META   (141): 18-hulls bane (par 72) i Sola grunnlagt 1993. Greenfee fra 700 kr ukedag, 900 kr helg. Sesong April–Oktober. Se baneinfo, omtaler og kontakt.

/more-og-romsdal/aalesund-golfklubb-solnor-gaard
  TITLE  (48): Ålesund Golfklubb — 18 hull, greenfee fra 500 kr
  META   (131): 18-hulls bane (par 72) i Ålesund grunnlagt 1995. Greenfee fra 500 kr ukedag. Sesong April–oktober. Se baneinfo, omtaler og kontakt.

/akershus/haga-golfklubb
  TITLE  (46): Haga Golfklubb — 27 hull, greenfee fra 1100 kr
  META   (101): 27-hulls bane i Bekkestua grunnlagt 2003. Greenfee fra 1100 kr helg. Se baneinfo, omtaler og kontakt.

/akershus/losby-golfklubb
  TITLE  (59): Losby Golfklubb — 27 hull i Finstadjordet: greenfee og kart
  META   (84): 27-hulls bane i Finstadjordet, Lørenskog. Se baneinfo, greenfee, omtaler og kontakt.

/vestfold/solum-golfklubb
  TITLE  (46): Solum Golfklubb — 18 hull, greenfee fra 550 kr
  META   (135): 18-hulls bane (par 72) i Holmestrand grunnlagt 2003. Greenfee fra 550 kr ukedag. Sesong Mars–Desember. Se baneinfo, omtaler og kontakt.

/vestland/bergen-golfklubb
  TITLE  (46): Bergen Golfklubb — 9 hull, greenfee fra 575 kr
  META   (142): 9-hulls bane (par 34) i Bergen grunnlagt 1937. Greenfee fra 575 kr ukedag, 675 kr helg. Sesong April–Oktober. Se baneinfo, omtaler og kontakt.

/buskerud/tyrifjord-golfklubb
  TITLE  (60): Tyrifjord Golfklubb — 18 hull i Krokkleiva: greenfee og kart
  META   (116): 18-hulls bane (par 72) i Krokkleiva grunnlagt 1996. Sesong April–Oktober. Se baneinfo, greenfee, omtaler og kontakt.

/akershus/baerum-golfklubb
  TITLE  (56): Bærum Golfklubb — 18 hull i Lommedalen: greenfee og kart
  META   (77): 18-hulls bane i Lommedalen, Bærum. Se baneinfo, greenfee, omtaler og kontakt.

/oslo/groruddalen-golfklubb
  TITLE  (51): Groruddalen Golfklubb — 9 hull, greenfee fra 300 kr
  META   (138): 9-hulls bane (par 27) i Oslo grunnlagt 1988. Greenfee fra 300 kr ukedag, 350 kr helg. Sesong Mai–Oktober. Se baneinfo, omtaler og kontakt.

/vestfold/sandefjord-golfklubb
  TITLE  (51): Sandefjord Golfklubb — 18 hull, greenfee fra 650 kr
  META   (136): 18-hulls bane (par 72) i Sandefjord grunnlagt 2008. Greenfee fra 650 kr ukedag. Sesong Februar–Oktober. Se baneinfo, omtaler og kontakt.

/vestfold/sande-golfklubb
  TITLE  (53): Sande Golfklubb — 9 hull i Vestfold: greenfee og kart
  META   (122): 9-hulls bane (par 36) i Sande, Vestfold, grunnlagt 1999. Sesong April–November. Se baneinfo, greenfee, omtaler og kontakt.

/trondelag/byneset-golfklubb
  TITLE  (48): Byneset Golfklubb — 27 hull, greenfee fra 700 kr
  META   (134): 27-hulls bane (par 72) i Trondheim grunnlagt 1995. Greenfee fra 700 kr ukedag. Sesong April–November. Se baneinfo, omtaler og kontakt.

/ostfold/onsoy-golfklubb
  TITLE  (46): Onsøy Golfklubb — 18 hull, greenfee fra 695 kr
  META   (122): 18-hulls bane (par 72) i Manstad grunnlagt 1987. Greenfee fra 695 kr ukedag, 745 kr helg. Se baneinfo, omtaler og kontakt.

/vestfold/hof-golfklubb
  TITLE  (43): Hof Golfklubb — 9 hull, greenfee fra 400 kr
  META   (138): 9-hulls bane (par 33) i Hof, Vestfold, grunnlagt 1996. Greenfee fra 400 kr ukedag. Sesong April–November. Se baneinfo, omtaler og kontakt.

/ostfold/moss-rygge-golfklubb
  TITLE  (53): Moss & Rygge Golfklubb — 18 hull, greenfee fra 750 kr
  META   (144): 18-hulls bane (par 72) i Dilling, Rygge, grunnlagt 2004. Greenfee fra 750 kr ukedag, 800 kr helg. Sesong April–November. Se baneinfo og omtaler.

/trondelag/klaebu-golfklubb
  TITLE  (45): Klæbu Golfklubb — 9 hull, greenfee fra 400 kr
  META   (126): 9-hulls bane (par 32) i Klæbu grunnlagt 2001. Greenfee fra 400 kr ukedag. Sesong Mai–Oktober. Se baneinfo, omtaler og kontakt.

/innlandet/hafjell-golfklubb
  TITLE  (51): Hafjell Golfklubb — 9 hull i Øyer: greenfee og kart
  META   (120): 9-hulls bane (par 67) i Øyer ved Hafjell, grunnlagt 2002. Sesong mai–oktober. Se baneinfo, greenfee, omtaler og kontakt.

/ostfold/askim-golfklubb
  TITLE  (46): Askim Golfklubb — 18 hull, greenfee fra 400 kr
  META   (130): 18-hulls bane (par 69) i Askim grunnlagt 1997. Greenfee fra 400 kr ukedag. Sesong April–November. Se baneinfo, omtaler og kontakt.

/trondelag/trondheim-golfklubb
  TITLE  (49): Trondheim Golfklubb — 9 hull, greenfee fra 350 kr
  META   (130): 9-hulls bane (par 36) i Trondheim grunnlagt 1950. Greenfee fra 350 kr ukedag. Sesong Mai–Oktober. Se baneinfo, omtaler og kontakt.

/vestfold/tjome-golfklubb
  TITLE  (51): Tjøme Golfklubb — 18 hull i Tjøme: greenfee og kart
  META   (113): 18-hulls bane (par 72) på Tjøme grunnlagt 1989. Sesong April–November. Se baneinfo, greenfee, omtaler og kontakt.

/more-og-romsdal/volda-golfklubb
  TITLE  (45): Volda Golfklubb — 9 hull, greenfee fra 400 kr
  META   (126): 9-hulls bane (par 35) i Volda grunnlagt 1998. Greenfee fra 400 kr ukedag. Sesong Mai–Oktober. Se baneinfo, omtaler og kontakt.

/akershus/krokhol-golfklubb
  TITLE  (55): Krokhol Golfklubb — 9 hull i Siggerud: greenfee og kart
  META   (117): 9-hulls bane (par 36) i Siggerud, Ski, grunnlagt 2004. Sesong Mai–Oktober. Se baneinfo, greenfee, omtaler og kontakt.

/nordland/bodo-golfklubb
  TITLE  (44): Bodø Golfklubb — 9 hull, greenfee fra 420 kr
  META   (129): 9-hulls bane (par 27) i Tverlandet, Bodø, grunnlagt 2005. Greenfee fra 420 kr ukedag. Sesong Mai–Oktober. Se baneinfo og omtaler.

/buskerud/drammen-golfklubb
  TITLE  (55): Drammen Golfklubb — 18 hull i Drammen: greenfee og kart
  META   (91): 18-hulls bane (par 71) i Drammen grunnlagt 1997. Se baneinfo, greenfee, omtaler og kontakt.

/akershus/lommedalen-golfklubb
  TITLE  (45): Lommedalen Golfklubb — 9 hull, par 67 i Bærum
  META   (101): 9-hulls bane (par 67) i Lommedalen, Bærum, grunnlagt 2003. Se baneinfo, greenfee, omtaler og kontakt.

```