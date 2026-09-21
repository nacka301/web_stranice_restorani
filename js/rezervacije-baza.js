/*
  REZERVACIJE-BAZA.JS
  ===================
  Puni sustav rezervacija sa stvarnom provjerom slobodnih mjesta,
  preko Supabase baze. Ovo je JEDINA datoteka u predlošku koja
  ovisi o vanjskoj usluzi (Supabase) i vanjskoj skripti učitanoj
  preko CDN-a — zato je odvojena od main.js i uključuje se samo
  kad klijent stvarno želi ovu, težu vrstu rezervacije
  (podaci.js -> rezervacija.nacin = "baza").

  main.js poziva funkciju inicijalizirajRezervacijuBaza(spremnik)
  ako postoji; ako ova datoteka nije uključena u index.html, main.js
  se ne ruši — jednostavno prikaže obavijest umjesto obrasca.

  Kako radi provjera slobodnih mjesta i sprječavanje dvostrukih
  rezervacija objašnjeno je u SQL migraciji u Supabase projektu
  (funkcije dostupni_termini i napravi_rezervaciju) — ovdje se te
  funkcije samo pozivaju preko supabase-js klijenta.
*/

function inicijalizirajRezervacijuBaza(spremnik) {
  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    spremnik.innerHTML = `<p class="obrazac__poruka obrazac__poruka--greska" style="display:block">
      Nedostaje Supabase skripta. U index.html otkomentirajte učitavanje
      supabase-js i js/supabase-konfig.js (vidi README).
    </p>`;
    return;
  }

  const klijent = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  spremnik.innerHTML = `
    <form class="obrazac" id="obrazac-baza" novalidate>
      <div class="obrazac__polje">
        <label for="rb-ime">Ime i prezime *</label>
        <input type="text" id="rb-ime" autocomplete="name">
      </div>
      <div class="obrazac__polje obrazac__polje--dvostupac">
        <div class="obrazac__polje">
          <label for="rb-kontakt">Telefon ili e-mail *</label>
          <input type="text" id="rb-kontakt" autocomplete="tel">
        </div>
        <div class="obrazac__polje">
          <label for="rb-broj-gostiju">Broj osoba *</label>
          <input type="number" id="rb-broj-gostiju" min="1" max="50" value="2">
        </div>
      </div>
      <div class="obrazac__polje">
        <label for="rb-datum">Datum *</label>
        <input type="date" id="rb-datum">
      </div>
      <div class="obrazac__polje" id="rb-termini-polje" hidden>
        <label>Slobodni termini *</label>
        <div class="termini-lista" id="rb-termini-lista"></div>
      </div>
      <div class="obrazac__polje">
        <label for="rb-napomena">Napomena</label>
        <textarea id="rb-napomena" rows="3"></textarea>
      </div>
      <div class="obrazac__poruka" id="rb-poruka"></div>
      <button type="submit" class="gumb gumb--puni gumb--puna-sirina" id="rb-posalji">
        Pošalji zahtjev za rezervaciju
      </button>
    </form>
  `;

  const obrazac = spremnik.querySelector("#obrazac-baza");
  const poljeDatum = spremnik.querySelector("#rb-datum");
  const poljeBrojGostiju = spremnik.querySelector("#rb-broj-gostiju");
  const poljeTerminiOmot = spremnik.querySelector("#rb-termini-polje");
  const poljeTerminiLista = spremnik.querySelector("#rb-termini-lista");
  const poruka = spremnik.querySelector("#rb-poruka");
  const gumbPosalji = spremnik.querySelector("#rb-posalji");

  // Datum ne smije biti u prošlosti.
  poljeDatum.min = new Date().toISOString().slice(0, 10);

  let odabranoVrijeme = null;

  poljeDatum.addEventListener("change", () => ucitajTermine());
  poljeBrojGostiju.addEventListener("input", () => osvjeziIzgledTermina());

  async function ucitajTermine() {
    odabranoVrijeme = null;
    poljeTerminiLista.innerHTML = "";
    poljeTerminiOmot.hidden = true;
    if (!poljeDatum.value) return;

    poljeTerminiLista.innerHTML = `<p class="obrazac__opis">Učitavam slobodne termine …</p>`;
    poljeTerminiOmot.hidden = false;

    const { data, error } = await klijent.rpc("dostupni_termini", { p_datum: poljeDatum.value });

    if (error) {
      poljeTerminiLista.innerHTML = "";
      prikaziPoruku("Greška pri dohvaćanju termina. Pokušajte ponovno.", "greska");
      return;
    }

    if (!data || data.length === 0) {
      poljeTerminiLista.innerHTML = `<p class="obrazac__opis">Za odabrani datum nema termina za rezervaciju.</p>`;
      return;
    }

    poljeTerminiLista.innerHTML = "";
    data.forEach((termin) => {
      const gumb = document.createElement("button");
      gumb.type = "button";
      gumb.className = "termin-opcija";
      gumb.dataset.vrijeme = termin.vrijeme;
      gumb.dataset.slobodno = termin.slobodno;
      gumb.innerHTML = `<span>${termin.vrijeme.slice(0, 5)}</span><small>${termin.slobodno} slobodno</small>`;
      gumb.addEventListener("click", () => odaberiTermin(gumb));
      poljeTerminiLista.appendChild(gumb);
    });

    osvjeziIzgledTermina();
  }

  function osvjeziIzgledTermina() {
    const potrebno = Number(poljeBrojGostiju.value) || 1;
    poljeTerminiLista.querySelectorAll(".termin-opcija").forEach((gumb) => {
      const slobodno = Number(gumb.dataset.slobodno);
      const puno = slobodno < potrebno;
      gumb.classList.toggle("termin-opcija--puno", puno);
      gumb.disabled = puno;
      if (puno && gumb.dataset.vrijeme === odabranoVrijeme) {
        odaberiTermin(null);
      }
    });
  }

  function odaberiTermin(gumb) {
    poljeTerminiLista.querySelectorAll(".termin-opcija").forEach((g) => {
      g.classList.remove("termin-opcija--odabran");
    });
    if (gumb) {
      gumb.classList.add("termin-opcija--odabran");
      odabranoVrijeme = gumb.dataset.vrijeme;
    } else {
      odabranoVrijeme = null;
    }
  }

  function prikaziPoruku(tekst, vrsta) {
    poruka.textContent = tekst;
    poruka.className = "obrazac__poruka obrazac__poruka--" + vrsta;
  }

  obrazac.addEventListener("submit", async (dogadjaj) => {
    dogadjaj.preventDefault();

    const ime = spremnik.querySelector("#rb-ime").value.trim();
    const kontakt = spremnik.querySelector("#rb-kontakt").value.trim();
    const brojGostiju = Number(poljeBrojGostiju.value);
    const datum = poljeDatum.value;
    const napomena = spremnik.querySelector("#rb-napomena").value.trim();

    if (!ime) return prikaziPoruku("Molimo unesite ime i prezime.", "greska");
    if (!kontakt) return prikaziPoruku("Molimo unesite telefon ili e-mail.", "greska");
    if (!brojGostiju || brojGostiju < 1) return prikaziPoruku("Molimo unesite broj osoba.", "greska");
    if (!datum) return prikaziPoruku("Molimo odaberite datum.", "greska");
    if (!odabranoVrijeme) return prikaziPoruku("Molimo odaberite slobodan termin.", "greska");

    gumbPosalji.disabled = true;
    prikaziPoruku("Šaljem zahtjev …", "uspjeh");

    const { data, error } = await klijent.rpc("napravi_rezervaciju", {
      p_ime: ime,
      p_kontakt: kontakt,
      p_broj_osoba: brojGostiju,
      p_datum: datum,
      p_vrijeme: odabranoVrijeme,
      p_napomena: napomena || null,
    });

    gumbPosalji.disabled = false;

    if (error) {
      prikaziPoruku("Greška pri slanju. Pokušajte ponovno ili nas nazovite.", "greska");
      return;
    }

    const rezultat = data && data[0];
    if (!rezultat || !rezultat.ok) {
      prikaziPoruku((rezultat && rezultat.poruka) || "Rezervacija nije uspjela.", "greska");
      ucitajTermine();
      return;
    }

    prikaziPoruku(rezultat.poruka, "uspjeh");
    obrazac.reset();
    poljeTerminiOmot.hidden = true;
    poljeTerminiLista.innerHTML = "";
    odabranoVrijeme = null;
  });
}
