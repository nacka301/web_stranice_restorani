/*
  MAIN.JS
  =======
  Sva mehanika predloška: čita podatke iz PODACI (podaci.js) i puni
  praznu HTML strukturu. Svaka funkcija provjerava postoji li
  element prije nego ga dira, pa ako neku sekciju obrišete iz
  index.html (ili je JS ukloni jer je isključena), ništa se ne
  ruši i u konzoli nema grešaka.

  Ovu datoteku ne treba mijenjati za novog klijenta — sve što se
  mijenja po klijentu ide u podaci.js i css/varijable.css.
*/

document.addEventListener("DOMContentLoaded", () => {
  postaviZaglavlje();
  postaviNaslovnicu();
  postaviONama();
  postaviJelovnik();
  postaviRezervaciju();
  postaviGaleriju();
  postaviRadnoVrijemeILokaciju();
  postaviKontakt();
  postaviPodnozje();

  // Izbornik se gradi tek na kraju, kad su sve neobavezne sekcije
  // već uklonjene — tako uvijek prikazuje samo ono što stvarno postoji.
  izgradiIzbornik();

  pokreniHamburger();
  pokreniSjenuZaglavlja();
  pokreniAnimacijuPojavljivanja();
});

/* ============================================================
   POMOĆNE FUNKCIJE
   Male funkcije koje ponovno koristimo na više mjesta, da se
   logika (npr. postavljanje slike s rezervnim prikazom) ne
   ponavlja.
   ============================================================ */

// Vraća element po id-u ili null — kraći zapis od document.getElementById.
function el(id) {
  return document.getElementById(id);
}

// Puni <img> unutar "rezervata za sliku"; ako putanje nema, slika se
// ni ne pokušava učitati i ostaje vidljiv CSS placeholder s natpisom.
function postaviSliku(imgElement, putanja, altTekst) {
  if (!imgElement) return;
  if (!putanja) return;
  imgElement.src = putanja;
  imgElement.alt = altTekst || "";
  // Ako datoteka ne postoji (klijent je još nije ubacio), sakrij
  // sliku da se vidi uredni placeholder ispod nje.
  imgElement.addEventListener("error", () => {
    imgElement.style.display = "none";
  });
}

// Formatira broj u europski zapis cijene, npr. 8.5 -> "8,50 €".
function formatirajCijenu(broj) {
  return Number(broj).toFixed(2).replace(".", ",") + " €";
}

/* ============================================================
   ZAGLAVLJE
   ============================================================ */

function postaviZaglavlje() {
  const naziv = el("zaglavlje-naziv");
  if (!naziv) return;

  if (PODACI.logo) {
    const slika = document.createElement("img");
    slika.className = "zaglavlje__logo";
    slika.alt = PODACI.naziv;
    slika.src = PODACI.logo;
    naziv.appendChild(slika);
  }

  const tekst = document.createElement("span");
  tekst.textContent = PODACI.naziv;
  naziv.appendChild(tekst);
}

/* ============================================================
   IZBORNIK
   Gradi se iz svih <section data-izbornik="..."> koje su ostale
   u <main> nakon što su neobavezne sekcije (rezervacija, galerija)
   po potrebi uklonjene.
   ============================================================ */

function izgradiIzbornik() {
  const izbornik = el("izbornik");
  if (!izbornik) return;

  const sekcije = document.querySelectorAll("main > section[data-izbornik]");
  sekcije.forEach((sekcija) => {
    const stavka = document.createElement("a");
    stavka.href = "#" + sekcija.id;
    stavka.className = "izbornik__stavka";
    stavka.textContent = sekcija.dataset.izbornik;
    stavka.addEventListener("click", () => zatvoriIzbornik());
    izbornik.appendChild(stavka);
  });
}

function pokreniHamburger() {
  const gumb = el("hamburger");
  const izbornik = el("izbornik");
  if (!gumb || !izbornik) return;

  gumb.addEventListener("click", () => {
    const otvoren = izbornik.classList.toggle("izbornik--otvoren");
    gumb.setAttribute("aria-expanded", String(otvoren));
    gumb.setAttribute("aria-label", otvoren ? "Zatvori izbornik" : "Otvori izbornik");
  });

  window.addEventListener("scroll", () => {
    if (izbornik.classList.contains("izbornik--otvoren")) {
      zatvoriIzbornik();
    }
  }, { passive: true });
}

function zatvoriIzbornik() {
  const gumb = el("hamburger");
  const izbornik = el("izbornik");
  if (!gumb || !izbornik) return;
  izbornik.classList.remove("izbornik--otvoren");
  gumb.setAttribute("aria-expanded", "false");
  gumb.setAttribute("aria-label", "Otvori izbornik");
}

// Blaga sjena ispod zaglavlja tek kad se stranica odlista, da
// zaglavlje na vrhu ne "reže" hero fotografiju linijom sjene.
function pokreniSjenuZaglavlja() {
  const zaglavlje = el("zaglavlje");
  if (!zaglavlje) return;

  const postaviSjenu = () => {
    zaglavlje.classList.toggle("zaglavlje--odliston", window.scrollY > 10);
  };
  postaviSjenu();
  window.addEventListener("scroll", postaviSjenu, { passive: true });
}

/* ============================================================
   NASLOVNICA (HERO)
   ============================================================ */

function postaviNaslovnicu() {
  const naziv = el("hero-naziv");
  const slogan = el("hero-slogan");
  const rezerviraj = el("hero-rezerviraj-gumb");

  if (naziv) naziv.textContent = PODACI.naziv;
  if (slogan) slogan.textContent = PODACI.slogan || "";

  if (rezerviraj) {
    if (el("rezervacija")) {
      rezerviraj.href = "#rezervacija";
    } else if (PODACI.telefon) {
      rezerviraj.href = "tel:" + PODACI.telefon.replace(/\s+/g, "");
    } else {
      rezerviraj.remove();
    }
  }

  postaviSliku(el("hero-slika"), PODACI.hero && PODACI.hero.slika, PODACI.naziv);
  document.title = PODACI.naziv + (PODACI.slogan ? " — " + PODACI.slogan : "");
}

/* ============================================================
   O NAMA
   ============================================================ */

function postaviONama() {
  const sekcija = el("o-nama");
  const podatak = PODACI.oNama;
  if (!sekcija) return;

  if (!podatak || (!podatak.tekst && !podatak.slika)) {
    sekcija.remove();
    return;
  }

  const naslov = el("o-nama-naslov");
  const tekst = el("o-nama-tekst");

  if (naslov) naslov.textContent = podatak.naslov || "O nama";

  if (tekst) {
    // Odlomci se u podaci.js odvajaju prazim retkom (\n\n).
    const odlomci = (podatak.tekst || "").split(/\n\s*\n/).filter(Boolean);
    odlomci.forEach((odlomak) => {
      const p = document.createElement("p");
      p.textContent = odlomak.trim();
      tekst.appendChild(p);
    });
  }

  postaviSliku(el("o-nama-slika"), podatak.slika, podatak.naslov || "O nama");
}

/* ============================================================
   JELOVNIK
   Filteri kategorija su gumbi koji preko atributa
   data-kategorija sakrivaju/prikazuju kartice bez ponovnog
   učitavanja stranice.
   ============================================================ */

function postaviJelovnik() {
  const sekcija = el("jelovnik");
  const kategorije = PODACI.kategorijeJelovnika || [];
  if (!sekcija) return;

  if (kategorije.length === 0) {
    sekcija.remove();
    return;
  }

  izgradiGumbPdf();
  izgradiFiltereJelovnika(kategorije);
  izgradiKarticeJelovnika(kategorije);
}

function izgradiGumbPdf() {
  const spremnik = el("jelovnik-pdf");
  if (!spremnik) return;
  if (!PODACI.jelovnikPdf) {
    // Bez PDF-a spremnik uklanjamo umjesto da ostavimo prazan razmak.
    spremnik.remove();
    return;
  }

  const gumb = document.createElement("a");
  gumb.href = PODACI.jelovnikPdf;
  gumb.className = "gumb gumb--obris";
  gumb.target = "_blank";
  gumb.rel = "noopener noreferrer";
  gumb.textContent = "Preuzmi cijeli jelovnik";
  spremnik.appendChild(gumb);
}

function izgradiFiltereJelovnika(kategorije) {
  const spremnik = el("jelovnik-filteri");
  if (!spremnik) return;

  const napraviGumb = (naziv, aktivan) => {
    const gumb = document.createElement("button");
    gumb.type = "button";
    gumb.className = "jelovnik__filter";
    gumb.textContent = naziv;
    gumb.dataset.kategorija = naziv === "Sve" ? "sve" : naziv;
    gumb.setAttribute("aria-pressed", String(aktivan));
    gumb.addEventListener("click", () => filtrirajJelovnik(gumb.dataset.kategorija));
    return gumb;
  };

  spremnik.appendChild(napraviGumb("Sve", true));
  kategorije.forEach((kategorija) => {
    spremnik.appendChild(napraviGumb(kategorija.naziv, false));
  });
}

function izgradiKarticeJelovnika(kategorije) {
  const spremnik = el("jelovnik-mreza");
  if (!spremnik) return;

  kategorije.forEach((kategorija) => {
    (kategorija.stavke || []).forEach((stavka) => {
      spremnik.appendChild(izgradiKarticuJela(stavka, kategorija.naziv));
    });
  });
}

function izgradiKarticuJela(stavka, nazivKategorije) {
  const kartica = document.createElement("article");
  kartica.className = "jelo-kartica";
  kartica.dataset.kategorija = nazivKategorije;

  if (stavka.slika) {
    const omotSlike = document.createElement("div");
    omotSlike.className = "media-rezervat media-rezervat--tiho jelo-kartica__slika";
    const slika = document.createElement("img");
    slika.loading = "lazy";
    omotSlike.appendChild(slika);
    postaviSliku(slika, stavka.slika, stavka.naziv);
    kartica.appendChild(omotSlike);
  }

  const sadrzaj = document.createElement("div");
  sadrzaj.className = "jelo-kartica__sadrzaj";

  const redak = document.createElement("div");
  redak.className = "jelo-kartica__redak";

  const naziv = document.createElement("h3");
  naziv.className = "jelo-kartica__naziv";
  naziv.textContent = stavka.naziv;
  redak.appendChild(naziv);

  if (typeof stavka.cijena === "number") {
    const cijena = document.createElement("span");
    cijena.className = "jelo-kartica__cijena";
    cijena.textContent = formatirajCijenu(stavka.cijena);
    redak.appendChild(cijena);
  }

  sadrzaj.appendChild(redak);

  if (stavka.opis) {
    const opis = document.createElement("p");
    opis.className = "jelo-kartica__opis";
    opis.textContent = stavka.opis;
    sadrzaj.appendChild(opis);
  }

  if (stavka.oznake && stavka.oznake.length > 0) {
    const znacke = document.createElement("div");
    znacke.className = "jelo-kartica__znacke";
    stavka.oznake.forEach((oznaka) => {
      const znacka = document.createElement("span");
      znacka.className = "znacka";
      znacka.textContent = oznaka;
      znacke.appendChild(znacka);
    });
    sadrzaj.appendChild(znacke);
  }

  kartica.appendChild(sadrzaj);
  return kartica;
}

function filtrirajJelovnik(kategorija) {
  const spremnikFiltera = el("jelovnik-filteri");
  const kartice = document.querySelectorAll("#jelovnik-mreza .jelo-kartica");

  if (spremnikFiltera) {
    spremnikFiltera.querySelectorAll(".jelovnik__filter").forEach((gumb) => {
      gumb.setAttribute("aria-pressed", String(gumb.dataset.kategorija === kategorija));
    });
  }

  kartice.forEach((kartica) => {
    const prikazi = kategorija === "sve" || kartica.dataset.kategorija === kategorija;
    kartica.style.display = prikazi ? "" : "none";
  });
}

/* ============================================================
   REZERVACIJA
   Statična stranica bez poslužitelja, pa rezervacija nikad ne
   šalje podatke nikamo osim u tel:, mailto: ili wa.me poveznicu
   koju sam preglednik otvara.
   ============================================================ */

function postaviRezervaciju() {
  const sekcija = el("rezervacija");
  const postavke = PODACI.rezervacija;
  if (!sekcija) return;

  if (!postavke || !postavke.ukljuceno) {
    sekcija.remove();
    return;
  }

  const spremnik = el("rezervacija-sadrzaj");
  if (!spremnik) return;

  if (postavke.nacin === "telefon") {
    spremnik.appendChild(izgradiRezervacijuTelefon());
  } else if (postavke.nacin === "whatsapp" || postavke.nacin === "email") {
    spremnik.appendChild(izgradiObrazacRezervacije(postavke.nacin));
  } else {
    // Nepoznata ili nepostavljena vrijednost — sigurnosno, sekciju uklanjamo
    // umjesto da prikažemo prazan/pokvaren sadržaj.
    sekcija.remove();
  }
}

function izgradiRezervacijuTelefon() {
  const omot = document.createElement("div");
  omot.className = "rezervacija--telefon";

  const gumb = document.createElement("a");
  gumb.className = "gumb gumb--puni";
  gumb.href = "tel:" + (PODACI.telefon || "").replace(/\s+/g, "");
  gumb.textContent = "Nazovite nas: " + (PODACI.telefon || "");

  omot.appendChild(gumb);
  return omot;
}

function izgradiObrazacRezervacije(nacin) {
  const obrazac = document.createElement("form");
  obrazac.className = "obrazac";
  obrazac.noValidate = true;

  obrazac.innerHTML = `
    <div class="rez-koraci" aria-label="Korak rezervacije">
      <span class="rez-korak rez-korak--aktivan" data-korak="1">01 <small>Termin</small></span>
      <i></i>
      <span class="rez-korak" data-korak="2">02 <small>Podaci</small></span>
    </div>
    <div class="rez-korak-sadrzaj rez-korak-sadrzaj--aktivan" data-sadrzaj="1">
      <p class="rez-korak__naslov">Pronađite slobodan termin</p>
      <div class="obrazac__polje">
        <label for="rez-broj-gostiju">Broj osoba *</label>
        <input type="number" id="rez-broj-gostiju" name="brojGostiju" min="1" max="50" inputmode="numeric" placeholder="Unesite broj osoba">
      </div>
      <div class="obrazac__polje">
        <label>Odaberite datum *</label>
        <div class="rez-kalendar" id="rez-kalendar"></div>
      </div>
      <div class="obrazac__polje" id="rez-termini-polje" hidden>
        <label>Slobodni termini</label>
        <div class="termini-lista" id="rez-termini-lista"></div>
      </div>
      <button type="button" class="gumb gumb--puni gumb--puna-sirina" id="rez-nastavi">Nastavi na podatke →</button>
    </div>
    <div class="rez-korak-sadrzaj" data-sadrzaj="2" hidden>
      <p class="rez-korak__naslov">Još samo vaši podaci</p>
      <div class="obrazac__polje">
        <label for="rez-ime">Ime i prezime *</label>
        <input type="text" id="rez-ime" name="ime" autocomplete="name" placeholder="Vaše ime i prezime">
      </div>
      <div class="obrazac__polje">
        <label for="rez-telefon">Broj mobitela *</label>
        <input type="tel" id="rez-telefon" name="telefon" autocomplete="tel" inputmode="tel" placeholder="099 123 4567">
      </div>
      <div class="obrazac__polje">
        <label for="rez-napomena">Napomena</label>
        <textarea id="rez-napomena" name="napomena" rows="3" placeholder="Posebna napomena (opcionalno)"></textarea>
      </div>
      <div class="rez-korak__gumbi">
        <button type="button" class="gumb gumb--obris" id="rez-nazad">← Nazad</button>
        <button type="submit" class="gumb gumb--puni">${nacin === "whatsapp" ? "Pošalji putem WhatsAppa" : "Pošalji e-mail"}</button>
      </div>
    </div>
    <div class="obrazac__poruka" id="rez-poruka"></div>
  `;

  const odabrani = {
    datum: "",
    vrijeme: "",
  };

  const brojGostiju = obrazac.querySelector("#rez-broj-gostiju");
  const kalendar = obrazac.querySelector("#rez-kalendar");
  const terminiPolje = obrazac.querySelector("#rez-termini-polje");
  const terminiLista = obrazac.querySelector("#rez-termini-lista");
  const korakPrvi = obrazac.querySelector('[data-sadrzaj="1"]');
  const korakDrugi = obrazac.querySelector('[data-sadrzaj="2"]');
  const poruka = obrazac.querySelector("#rez-poruka");

  obrazac.querySelector("#rez-nastavi").addEventListener("click", () => {
    const broj = obrazac.brojGostiju.value.trim();
    if (!broj || Number(broj) < 1) {
      prikaziPorukuObrasca(poruka, "Molimo unesite broj osoba.", "greska");
      return;
    }
    if (!odabrani.datum) {
      prikaziPorukuObrasca(poruka, "Molimo odaberite datum.", "greska");
      return;
    }
    if (!odabrani.vrijeme) {
      prikaziPorukuObrasca(poruka, "Molimo odaberite slobodan termin.", "greska");
      return;
    }
    korakPrvi.hidden = true;
    korakDrugi.hidden = false;
    obrazac.querySelectorAll(".rez-korak").forEach((korak) => korak.classList.toggle("rez-korak--aktivan", korak.dataset.korak === "2"));
    poruka.className = "obrazac__poruka";
    requestAnimationFrame(() => {
      korakDrugi.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  obrazac.querySelector("#rez-nazad").addEventListener("click", () => {
    korakDrugi.hidden = true;
    korakPrvi.hidden = false;
    obrazac.querySelectorAll(".rez-korak").forEach((korak) => korak.classList.toggle("rez-korak--aktivan", korak.dataset.korak === "1"));
    requestAnimationFrame(() => {
      korakPrvi.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  napraviKalendar(kalendar, odabrani, terminiPolje, terminiLista, brojGostiju);
  brojGostiju.addEventListener("input", () => {
    if (odabrani.datum) prikaziTermine(odabrani, terminiPolje, terminiLista, brojGostiju);
  });

  obrazac.addEventListener("submit", (dogadjaj) => {
    dogadjaj.preventDefault();
    posaljiRezervaciju(obrazac, nacin, odabrani);
  });

  return obrazac;
}

function napraviKalendar(kalendar, odabrani, terminiPolje, terminiLista, brojGostiju) {
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);
  let prikazaniMjesec = new Date(danas.getFullYear(), danas.getMonth(), 1);

  const iscrtaj = () => {
    kalendar.innerHTML = "";
    const naslov = document.createElement("div");
    naslov.className = "rez-kalendar__zaglavlje";

    const prethodni = document.createElement("button");
    prethodni.type = "button";
    prethodni.className = "rez-kalendar__strelica";
    prethodni.textContent = "‹";
    prethodni.setAttribute("aria-label", "Prethodni mjesec");
    prethodni.disabled = prikazaniMjesec <= new Date(danas.getFullYear(), danas.getMonth(), 1);
    prethodni.addEventListener("click", () => {
      prikazaniMjesec.setMonth(prikazaniMjesec.getMonth() - 1);
      iscrtaj();
    });

    const mjesec = document.createElement("strong");
    mjesec.textContent = prikazaniMjesec.toLocaleDateString("hr-HR", { month: "long", year: "numeric" });

    const sljedeci = document.createElement("button");
    sljedeci.type = "button";
    sljedeci.className = "rez-kalendar__strelica";
    sljedeci.textContent = "›";
    sljedeci.setAttribute("aria-label", "Sljedeći mjesec");
    sljedeci.addEventListener("click", () => {
      prikazaniMjesec.setMonth(prikazaniMjesec.getMonth() + 1);
      iscrtaj();
    });

    naslov.append(prethodni, mjesec, sljedeci);
    kalendar.appendChild(naslov);

    const dani = document.createElement("div");
    dani.className = "rez-kalendar__dani";
    ["Po", "Ut", "Sr", "Če", "Pe", "Su", "Ne"].forEach((dan) => {
      const oznaka = document.createElement("span");
      oznaka.textContent = dan;
      dani.appendChild(oznaka);
    });

    const prviDan = new Date(prikazaniMjesec.getFullYear(), prikazaniMjesec.getMonth(), 1);
    const pomak = (prviDan.getDay() + 6) % 7;
    for (let i = 0; i < pomak; i += 1) dani.appendChild(document.createElement("span"));

    const brojDana = new Date(prikazaniMjesec.getFullYear(), prikazaniMjesec.getMonth() + 1, 0).getDate();
    for (let dan = 1; dan <= brojDana; dan += 1) {
      const datum = new Date(prikazaniMjesec.getFullYear(), prikazaniMjesec.getMonth(), dan);
      const datumTekst = datum.toISOString().slice(0, 10);
      const status = statusDana(datum, danas);
      const gumb = document.createElement("button");
      gumb.type = "button";
      gumb.className = "rez-kalendar__dan rez-kalendar__dan--" + status;
      gumb.textContent = String(dan);
      gumb.disabled = status !== "slobodno";
      gumb.title = status === "slobodno" ? "Ima slobodnih termina" : "Nema slobodnih termina";
      if (datumTekst === odabrani.datum) gumb.classList.add("rez-kalendar__dan--odabran");
      gumb.addEventListener("click", () => {
        odabrani.datum = datumTekst;
        odabrani.vrijeme = "";
        iscrtaj();
        prikaziTermine(odabrani, terminiPolje, terminiLista, brojGostiju);
      });
      dani.appendChild(gumb);
    }

    kalendar.appendChild(dani);
    const legenda = document.createElement("div");
    legenda.className = "rez-kalendar__legenda";
    legenda.innerHTML = '<span><i class="legenda--slobodno"></i> Ima mjesta</span><span><i class="legenda--puno"></i> Popunjeno</span>';
    kalendar.appendChild(legenda);
  };

  iscrtaj();
}

function statusDana(datum, danas) {
  if (datum < danas || datum.getDay() === 0) return "puno";
  // Demo raspored: povremeno popunjen dan da se vide oba stanja u MVP-u.
  if (datum.getDate() % 7 === 0 || datum.getDate() % 11 === 0) return "puno";
  return "slobodno";
}

function prikaziTermine(odabrani, omot, lista, brojGostiju) {
  omot.hidden = false;
  lista.innerHTML = "";
  const potrebno = Number(brojGostiju.value) || 1;
  const termini = ["12:00", "13:30", "18:00", "19:30", "21:00"];
  termini.forEach((vrijeme, index) => {
    const slobodno = Math.max(0, 8 - ((index + Number(odabrani.datum.slice(-2))) % 5));
    const gumb = document.createElement("button");
    gumb.type = "button";
    gumb.className = "termin-opcija";
    gumb.disabled = slobodno < potrebno;
    gumb.innerHTML = `<span>${vrijeme}</span><small class="${gumb.disabled ? "termin-opcija__puno" : ""}">${gumb.disabled ? "Nema dovoljno mjesta" : slobodno + " mjesta"}</small>`;
    gumb.addEventListener("click", () => {
      lista.querySelectorAll(".termin-opcija").forEach((stavka) => stavka.classList.remove("termin-opcija--odabran"));
      gumb.classList.add("termin-opcija--odabran");
      odabrani.vrijeme = vrijeme;
    });
    lista.appendChild(gumb);
  });
}

function posaljiRezervaciju(obrazac, nacin, odabrani) {
  const poruka = obrazac.querySelector("#rez-poruka");
  const ime = obrazac.ime.value.trim();
  const telefon = obrazac.telefon.value.trim();
  const brojGostiju = obrazac.brojGostiju.value.trim();
  const datum = odabrani.datum;
  const vrijeme = odabrani.vrijeme;
  const napomena = obrazac.napomena.value.trim();

  const greska = provjeriObrazacRezervacije(ime, brojGostiju, datum);
  if (greska) {
    prikaziPorukuObrasca(poruka, greska, "greska");
    return;
  }
  if (!telefon) {
    prikaziPorukuObrasca(poruka, "Molimo unesite broj mobitela.", "greska");
    return;
  }
  if (!vrijeme) {
    prikaziPorukuObrasca(poruka, "Molimo odaberite slobodan termin.", "greska");
    return;
  }

  let tekstPoruke =
    `Rezervacija stola\n` +
    `Ime: ${ime}\n` +
    `Telefon: ${telefon}\n` +
    `Broj osoba: ${brojGostiju}\n` +
    `Datum: ${datum}` + (vrijeme ? ` u ${vrijeme}` : "") + `\n`;
  if (napomena) tekstPoruke += `Napomena: ${napomena}\n`;

  if (nacin === "whatsapp") {
    const broj = (PODACI.rezervacija.whatsappBroj || "").replace(/\D/g, "");
    const poveznica = `https://wa.me/${broj}?text=${encodeURIComponent(tekstPoruke)}`;
    window.open(poveznica, "_blank", "noopener");
  } else {
    const predmet = encodeURIComponent("Rezervacija stola — " + PODACI.naziv);
    const tijelo = encodeURIComponent(tekstPoruke);
    const primatelj = PODACI.rezervacija.emailZaRezervacije || PODACI.email;
    window.location.href = `mailto:${primatelj}?subject=${predmet}&body=${tijelo}`;
  }

  prikaziPorukuObrasca(poruka, "Hvala! Otvara se " + (nacin === "whatsapp" ? "WhatsApp" : "e-mail") + " s pripremljenom porukom.", "uspjeh");
  obrazac.reset();
}

function provjeriObrazacRezervacije(ime, brojGostiju, datum) {
  if (!ime) return "Molimo unesite ime i prezime.";
  if (!brojGostiju || Number(brojGostiju) < 1) return "Molimo unesite broj osoba.";
  if (!datum) return "Molimo odaberite datum.";

  const odabraniDatum = new Date(datum + "T00:00:00");
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);
  if (odabraniDatum < danas) return "Datum ne smije biti u prošlosti.";

  return null;
}

function prikaziPorukuObrasca(element, tekst, vrsta) {
  if (!element) return;
  element.textContent = tekst;
  element.className = "obrazac__poruka obrazac__poruka--" + vrsta;
}

/* ============================================================
   GALERIJA
   ============================================================ */

function postaviGaleriju() {
  const sekcija = el("galerija");
  const slike = PODACI.galerija || [];
  if (!sekcija) return;

  if (slike.length === 0) {
    sekcija.remove();
    return;
  }

  const mreza = el("galerija-mreza");
  if (!mreza) return;

  slike.forEach((putanja, indeks) => {
    const gumb = document.createElement("button");
    gumb.type = "button";
    gumb.className = "media-rezervat galerija__stavka";
    gumb.dataset.oznaka = "Galerija " + (indeks + 1);
    gumb.setAttribute("aria-label", "Otvori fotografiju " + (indeks + 1));

    const slika = document.createElement("img");
    slika.loading = "lazy";
    gumb.appendChild(slika);
    postaviSliku(slika, putanja, PODACI.naziv + " — fotografija " + (indeks + 1));

    gumb.addEventListener("click", () => otvoriLightbox(putanja, slika.alt));
    mreza.appendChild(gumb);
  });

  pokreniLightbox();
}

function otvoriLightbox(putanja, altTekst) {
  const lightbox = el("lightbox");
  const slika = el("lightbox-slika");
  if (!lightbox || !slika) return;

  slika.src = putanja;
  slika.alt = altTekst || "";
  lightbox.hidden = false;
  el("lightbox-zatvori") && el("lightbox-zatvori").focus();
}

function zatvoriLightbox() {
  const lightbox = el("lightbox");
  if (!lightbox) return;
  lightbox.hidden = true;
}

function pokreniLightbox() {
  const lightbox = el("lightbox");
  const gumbZatvori = el("lightbox-zatvori");
  if (!lightbox) return;

  if (gumbZatvori) gumbZatvori.addEventListener("click", zatvoriLightbox);

  // Klik izvan slike (na tamnu pozadinu) zatvara prikaz.
  lightbox.addEventListener("click", (dogadjaj) => {
    if (dogadjaj.target === lightbox) zatvoriLightbox();
  });

  document.addEventListener("keydown", (dogadjaj) => {
    if (dogadjaj.key === "Escape" && !lightbox.hidden) zatvoriLightbox();
  });
}

/* ============================================================
   RADNO VRIJEME I LOKACIJA
   ============================================================ */

function postaviRadnoVrijemeILokaciju() {
  izgradiTablicuRadnogVremena();

  const adresa = el("info-adresa");
  const gumbKarta = el("info-karta-gumb");
  const karta = el("info-karta");

  if (adresa) adresa.textContent = PODACI.adresa || "";

  if (gumbKarta) {
    if (PODACI.googleKarta) {
      gumbKarta.href = PODACI.googleKarta;
    } else {
      gumbKarta.remove();
    }
  }

  if (karta) {
    if (PODACI.adresa) {
      karta.src = "https://www.google.com/maps?q=" + encodeURIComponent(PODACI.adresa) + "&output=embed";
    } else {
      karta.remove();
    }
  }
}

function izgradiTablicuRadnogVremena() {
  const tijelo = document.querySelector("#radno-vrijeme-tablica tbody");
  const dani = PODACI.radnoVrijeme || [];
  if (!tijelo || dani.length === 0) {
    const sekcijaTablice = el("radno-vrijeme-tablica");
    if (sekcijaTablice) sekcijaTablice.remove();
    return;
  }

  // Nizovi u podaci.js kreću od ponedjeljka (indeks 0), a JS Date
  // broji od nedjelje (0), pa dan preslikavamo na ispravan indeks.
  const danasJs = new Date().getDay();
  const danasIndeks = danasJs === 0 ? 6 : danasJs - 1;

  dani.forEach((dan, indeks) => {
    const redak = document.createElement("tr");
    if (indeks === danasIndeks) redak.classList.add("danas");

    const celijaDan = document.createElement("td");
    celijaDan.textContent = dan.dan;

    const celijaVrijeme = document.createElement("td");
    celijaVrijeme.textContent = dan.zatvoreno ? "Zatvoreno" : `${dan.od} – ${dan.do}`;

    redak.appendChild(celijaDan);
    redak.appendChild(celijaVrijeme);
    tijelo.appendChild(redak);
  });
}

/* ============================================================
   KONTAKT
   ============================================================ */

// Jednostavne, jednobojne SVG ikone bez vanjskih poveznica —
// stranica mora raditi i bez interneta.
const IKONE = {
  telefon: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.3 21 3 13.7 3 4.7c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" fill="currentColor"/></svg>',
  email: '<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.4 2L12 12.5 19.6 7H4.4zM20 8.4l-7.4 5.3a1 1 0 0 1-1.2 0L4 8.4V17h16V8.4z" fill="currentColor"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M14 9h2.5V6H14c-1.9 0-3.5 1.6-3.5 3.5V11H8v3h2.5v6h3v-6H16l.5-3h-3V9.6c0-.3.3-.6.5-.6z" fill="currentColor"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M12 3a8.7 8.7 0 0 0-7.5 13.1L3 21l5-1.5A8.7 8.7 0 1 0 12 3zm0 15.6a6.8 6.8 0 0 1-3.5-1l-.3-.2-2.9.9.9-2.8-.2-.3A6.8 6.8 0 1 1 12 18.6zm3.8-5.1c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.6.8c-.1.2-.3.2-.5.1a5.5 5.5 0 0 1-2.7-2.4c-.2-.3 0-.4.1-.5l.4-.5c.1-.1.1-.3.1-.4l-.5-1.3c-.1-.3-.3-.3-.5-.3h-.4c-.2 0-.4.1-.6.3-.2.2-.7.7-.7 1.7s.7 2  .8 2.2a7.7 7.7 0 0 0 3 2.7c.4.2.8.3 1.1.4.5.2 1 .1 1.3.1.4-.1 1.2-.5 1.3-1 .2-.5.2-.9.1-1z" fill="currentColor"/></svg>',
};

function postaviKontakt() {
  const telefon = el("kontakt-telefon");
  const email = el("kontakt-email");

  if (telefon) {
    if (PODACI.telefon) {
      telefon.href = "tel:" + PODACI.telefon.replace(/\s+/g, "");
      const tekst = telefon.querySelector("strong");
      if (tekst) tekst.textContent = PODACI.telefon;
      else telefon.textContent = PODACI.telefon;
    } else {
      telefon.remove();
    }
  }

  if (email) {
    if (PODACI.email) {
      email.href = "mailto:" + PODACI.email;
      const tekst = email.querySelector("strong");
      if (tekst) tekst.textContent = PODACI.email;
      else email.textContent = PODACI.email;
    } else {
      email.remove();
    }
  }

  const mreze = el("kontakt-mreze");
  if (mreze) {
    dodajIkonuMreze(mreze, "facebook", PODACI.facebook, "Facebook stranica");
    dodajIkonuMreze(mreze, "instagram", PODACI.instagram, "Instagram profil");
  }

  const plutajuce = el("plutajuce-mreze");
  if (plutajuce) {
    const whatsappBroj = (PODACI.rezervacija && PODACI.rezervacija.whatsappBroj) || "";
    dodajIkonuMreze(plutajuce, "whatsapp", whatsappBroj ? "https://wa.me/" + whatsappBroj : "", "WhatsApp");
    dodajIkonuMreze(plutajuce, "instagram", PODACI.instagram, "Instagram profil");
    dodajIkonuMreze(plutajuce, "facebook", PODACI.facebook, "Facebook stranica");
  }
}

function dodajIkonuMreze(spremnik, kljuc, poveznica, naziv) {
  if (!poveznica) return;
  const veza = document.createElement("a");
  veza.href = poveznica;
  veza.target = "_blank";
  veza.rel = "noopener noreferrer";
  veza.setAttribute("aria-label", naziv);
  veza.innerHTML = IKONE[kljuc] || "";
  spremnik.appendChild(veza);
}

/* ============================================================
   PODNOŽJE
   ============================================================ */

function postaviPodnozje() {
  const naziv = el("podnozje-naziv");
  const tekst = el("podnozje-tekst");
  const autor = el("podnozje-autor");
  const godina = new Date().getFullYear();

  if (naziv) naziv.textContent = `© ${godina}. ${PODACI.naziv}.`;
  if (tekst) {
    if (PODACI.podnozje && PODACI.podnozje.tekst) {
      tekst.textContent = PODACI.podnozje.tekst;
    } else {
      tekst.remove();
    }
  }
  if (autor) {
    if (PODACI.podnozje && PODACI.podnozje.autor) {
      autor.textContent = PODACI.podnozje.autor;
    } else {
      autor.remove();
    }
  }
}

/* ============================================================
   ANIMACIJA POJAVLJIVANJA PRI LISTANJU
   Svakoj sekciji (osim naslovnice, koja je vidljiva odmah pri
   učitavanju) dodajemo klasu koja je čini prozirnom i pomaknutom,
   a IntersectionObserver otkriva je čim uđe u vidno polje.
   ============================================================ */

function pokreniAnimacijuPojavljivanja() {
  const sekcije = document.querySelectorAll("main > section:not(#naslovnica)");
  if (sekcije.length === 0) return;

  // Tko je u postavkama sustava isključio animacije, ne pokrećemo
  // ni promatrača — sekcije ostaju odmah vidljive (vidi i CSS).
  const zeliManjeAnimacija = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (zeliManjeAnimacija) return;

  sekcije.forEach((sekcija) => sekcija.classList.add("pojavi"));

  const promatrac = new IntersectionObserver(
    (unosi) => {
      unosi.forEach((unos) => {
        if (unos.isIntersecting) {
          unos.target.classList.add("pojavi--vidljivo");
          promatrac.unobserve(unos.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sekcije.forEach((sekcija) => promatrac.observe(sekcija));
}
