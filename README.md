# Predložak web stranice za ugostiteljske objekte

Jednostranična (`index.html`) web stranica za restorane, kafiće i slične
lokale. Čisti HTML/CSS/JS, bez build alata, bez interneta potrebnog za rad —
radi i dvoklikom na `index.html`.

## 1. Kako napraviti verziju za novog klijenta

1. Kopirajte cijeli projekt u novu mapu (npr. `kavana-queen/`).
2. Otvorite `js/podaci.js` i prepišite sve podatke: naziv, slogan, kontakt,
   radno vrijeme, jelovnik, galeriju, način rezervacije.
3. Otvorite `css/varijable.css` i promijenite boje (vidi popis niže).
4. Ubacite klijentove fotografije u `slike/` i u `podaci.js` upišite točne
   putanje do njih (npr. `slike/hero.jpg`). Ako slike još nemate, ostavite
   polje praznim — stranica će sama prikazati uredan rezervni prikaz mjesto
   slike, u točnom omjeru, pa se ništa neće pomaknuti kad sliku kasnije
   ubacite.
5. Ručno prepišite `<title>`, meta opis i Open Graph oznake u `<head>` u
   `index.html` (vidi napomenu u samoj datoteci — objašnjeno je zašto se to
   ne može popuniti automatski iz `podaci.js`).
6. `css/style.css`, `js/main.js` i struktura `index.html` ostaju
   nepromijenjeni — u njih dirajte samo ako želite promijeniti raspored ili
   dodati/izbaciti cijelu sekciju.

Svaka sekcija u `index.html` je omeđena komentarima
`<!-- ===== NAZIV ===== -->` / `<!-- ===== KRAJ NAZIVA ===== -->`, pa je
možete slobodno izbaciti, premjestiti ili udvostručiti — ostale sekcije i
JavaScript nastavljaju raditi bez izmjena, jer svaka JS funkcija prvo
provjeri postoji li element prije nego ga koristi.

## 2. `css/varijable.css` — popis vrijednosti

**Boje**

| Varijabla | Što je |
|---|---|
| `--boja-pozadina` | Glavna tamna pozadina stranice |
| `--boja-pozadina-svjetlija` | Pozadina naizmjeničnih sekcija (npr. jelovnik, galerija) |
| `--boja-povrsina` | Pozadina kartica (jela, rezervacija) |
| `--boja-obrub` | Tanke linije i obrubi kartica/tablice |
| `--boja-tekst` | Glavni tekst |
| `--boja-tekst-prigusen` | Sporedni tekst — opisi, meta informacije |
| `--boja-naglasak` | **Glavna boja identiteta** — gumbi, linkovi, cijene, ikone |
| `--boja-naglasak-tamnija` | Boja naglaska pri hoveru/kliku |
| `--boja-naglasak-tekst` | Boja teksta koji stoji NA naglasnoj boji (npr. slovo u punom gumbu) |
| `--boja-uspjeh` / `--boja-greska` | Poruke obrasca za rezervaciju |

Za brzu promjenu identiteta obično je dovoljno promijeniti
`--boja-naglasak` i `--boja-naglasak-tamnija`.

**Tipografija**

- `--font-naslovi` / `--font-tekst` — sistemski fontovi (bez interneta).
- `--velicina-h1/h2/h3` — veličine naslova, automatski se smanjuju na
  manjim ekranima (`clamp()`).
- `--visina-retka` — razmak između redaka teksta.

**Razmaci i oblik**

- `--razmak-xs` do `--razmak-xxl` — jedinstvena ljestvica razmaka koju
  koriste svi `gap` i `padding` u `style.css`.
- `--sirina-sadrzaja` — najveća širina sadržaja na velikim ekranima.
- `--odmak-rub` — razmak od ruba ekrana na mobitelu.
- `--zaobljenje-s/m/l` — zaobljenost kutova (gumbi/kartice/kartice velike).
- `--omjer-hero`, `--omjer-jelo`, `--omjer-galerija`, `--omjer-o-nama` —
  omjeri stranica fotografija; koriste se i za prazne rezervne prikaze.
- `--trajanje-brzo` / `--trajanje-sporo` — brzina hover efekata i
  animacije pojavljivanja pri listanju.

## 3. Objava na Vercelu

1. Stavite projekt u novi Git repozitorij (GitHub/GitLab/Bitbucket).
2. Na [vercel.com](https://vercel.com) → **Add New Project** → odaberite
   repozitorij.
3. Framework Preset: **Other**.
4. Build Command: ostavite **prazno**.
5. Output Directory: **`.`** (korijen projekta — ne mijenjajte).
6. Deploy.

Svaki klijent = poseban Vercel projekt = svoja adresa oblika
`naziv-projekta.vercel.app`. Smislenu adresu dobijete tako da projekt u
Vercelu nazovete po klijentu (npr. `kavana-queen`) prije prvog deploya —
to postaje zadana adresa. Adresu možete kasnije promijeniti i u
**Project Settings → Domains**, ili spojiti vlastitu domenu klijenta ako je
ima.

## 4. Dimenzije fotografija

Sve slike neka budu **JPG**, kvaliteta oko 70–80% (dovoljno dobro, malo
mjesta). Veće slike = sporije učitavanje na mobitelu, pa se držite ovih
okvirnih veličina:

| Slika | Preporučeni omjer | Preporučena širina | Najveća veličina |
|---|---|---|---|
| Naslovna (hero) | 16:9 | 1920 px | do 400 KB |
| O nama | 4:5 (portret) | 1000 px | do 250 KB |
| Fotografije jela | 4:3 | 800 px | do 150 KB |
| Galerija | 1:1 (kvadrat) | 1000 px | do 250 KB |

Ako je omjer stvarne fotografije drugačiji od navedenog, slika će i dalje
lijepo popuniti prostor (kadrira se preko `object-fit: cover`), ali za
najbolji rezultat snimajte/izrežite fotografije što bliže tim omjerima.

## 5. Rezervacija — uključivanje i način rada

U `js/podaci.js`, blok `rezervacija`:

```js
rezervacija: {
  ukljuceno: true,        // false = cijela sekcija nestaje sa stranice i iz izbornika
  nacin: "whatsapp",      // "telefon" | "whatsapp" | "email"
  whatsappBroj: "385912345678",       // samo brojevi, s pozivnim brojem, bez "+"
  emailZaRezervacije: "rezervacije@primjer.hr",
},
```

- **`"telefon"`** — prikazuje se jedan gumb koji pokreće poziv. Najjednostavnija
  opcija, ne treba dodatna polja.
- **`"whatsapp"`** — prikazuje se obrazac; nakon slanja otvara se WhatsApp s
  gotovom porukom. Potreban je `whatsappBroj`.
- **`"email"`** — isti obrazac, ali otvara e-mail klijent s gotovom porukom.
  Potreban je `emailZaRezervacije` (ako ga izostavite, koristi se glavni
  `email`).

Obrazac rezervacije traži datum, termin i željeni stol. Broj osoba se namjerno
ne traži u ovom MVP-u — restoran naknadno potvrđuje detalje rezervacije.

Stranica je statična i nema poslužitelj — ni u jednom načinu rada podaci
se ne šalju nikamo osim u tu jednu poveznicu (`tel:`, `wa.me` ili
`mailto:`) koju otvara preglednik.

Za demo prije slanja klijentu obavezno zamijenite WhatsApp broj, e-mail,
Instagram i Facebook poveznice u `js/podaci.js`. Trenutni podaci su samo
konfiguracija primjera. Ovaj MVP šalje zahtjev za rezervaciju; ne zaključava
stol u stvarnom vremenu i ne provjerava paralelne rezervacije u bazi.

---

## Kako je organiziran CSS i gdje ćete najčešće nešto mijenjati

`style.css` je podijeljen na jasno numerirane blokove (reset, pomoćne
klase, rezervat za sliku, gumbi, animacija, pa onda svaka sekcija stranice
svojim redom, istim redoslijedom kao u `index.html`). Svaki blok koristi
samo svoje, jasno prefiksirane klase (npr. sve što pripada jelovniku počinje
s `.jelovnik` ili `.jelo-kartica`) i ne oslanja se na to što dolazi prije ili
poslije njega — zato se sekcije u `index.html` mogu slobodno premještati,
brisati ili udvostručivati.

Tri mjesta na kojima ćete vjerojatno najčešće nešto mijenjati:

1. **`css/varijable.css`** — boje i razmaci. Gotovo svaka "kozmetička"
   izmjena za novog klijenta počinje i završava ovdje.
2. **`js/podaci.js`** — stvarni sadržaj (tekstovi, jelovnik, radno vrijeme,
   slike, rezervacija). Ovo je jedina datoteka s "pravim" podacima.
3. **Blok `4) REZERVAT ZA SLIKU` u `style.css`** (klasa `.media-rezervat`) —
   ako ikad poželite drukčiji izgled praznog prostora dok slika nedostaje
   (npr. drugu boju preljeva ili drugačiji font natpisa), sve je na jednom
   mjestu i utječe na hero, "O nama", jelovnik i galeriju odjednom.

Izradio David Vacka.
