/*
  PODACI.JS
  =========
  Ovo je JEDINA datoteka koju treba mijenjati za svakog novog klijenta
  (uz boje u css/varijable.css). Sve što main.js prikazuje na stranici
  dolazi odavde. Ako neko polje ostavite praznim, prazan nizom ili ga
  potpuno obrišete, main.js će preskočiti taj dio stranice bez greške.

  Napomena o putanjama: uvijek pišite "slike/naziv.jpg", nikad
  "/slike/naziv.jpg" (s kosom crtom na početku) — stranica mora raditi
  i lokalno (dvoklik na index.html) i na Vercelu.
*/

const PODACI = {

  // ---------- OSNOVNI PODACI O LOKALU ----------
  naziv: "Konoba Maslina",
  slogan: "Domaća kuhinja s pogledom na more",
  opisKratki: "Ovdje ide kratak opis restorana u jednoj ili dvije rečenice, koji se prikazuje u odjeljku 'O nama' i u meta opisu stranice.",

  // Putanja do logotipa (neobavezno). Ako je prazno, u zaglavlju se prikazuje samo naziv teksta.
  logo: "",

  // ---------- KONTAKT ----------
  adresa: "Obala 12, 21000 Split",
  telefon: "+385 91 234 5678",
  email: "info@primjer.hr",

  // Poveznica za Google karte (gumb "Otvori u Google kartama")
  googleKarta: "https://maps.google.com/?q=Konoba+Maslina+Split",

  // ---------- DRUŠTVENE MREŽE ----------
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/david_vacka12",

  // ---------- RADNO VRIJEME ----------
  // "zatvoreno: true" znači da je lokal taj dan zatvoren (prikazuje se "Zatvoreno").
  radnoVrijeme: [
    { dan: "Ponedjeljak", od: "11:00", do: "23:00", zatvoreno: false },
    { dan: "Utorak",      od: "11:00", do: "23:00", zatvoreno: false },
    { dan: "Srijeda",     od: "11:00", do: "23:00", zatvoreno: false },
    { dan: "Četvrtak",    od: "11:00", do: "23:00", zatvoreno: false },
    { dan: "Petak",       od: "11:00", do: "00:00", zatvoreno: false },
    { dan: "Subota",      od: "11:00", do: "00:00", zatvoreno: false },
    { dan: "Nedjelja",    od: "", do: "", zatvoreno: true },
  ],

  // ---------- NASLOVNICA (HERO) ----------
  hero: {
    slika: "slike/hero.jpg",
  },

  // ---------- O NAMA ----------
  oNama: {
    naslov: "O nama",
    tekst: "U Konobi Maslina njegujemo okuse domaće dalmatinske kuhinje i recepte koji se generacijama prenose za stolom. Svaki dan biramo svježe namirnice, kvalitetno meso, domaći sir, ribu i povrće od lokalnih proizvođača.\n\nNaša kuhinja je jednostavna, iskrena i puna okusa — od mirisa kruha iz peći i maslinovog ulja do jela koja se pripremaju polako, s pažnjom i poštovanjem prema tradiciji. Želimo da se kod nas osjećate kao za obiteljskim stolom, uz dobru hranu, čašu vina i pogled na more.",
    slika: "slike/o-nama.jpg",
  },

  // ---------- JELOVNIK ----------
  // Putanja do PDF jelovnika (neobavezno). Ako je prazno, gumb za preuzimanje se ne prikazuje.
  jelovnikPdf: "",

  kategorijeJelovnika: [
    {
      naziv: "Predjela",
      stavke: [
        {
          naziv: "Dalmatinska plata",
          opis: "Pršut, paški sir, masline i domaći kruh.",
          cijena: 12.50,
          slika: "slike/jela/predjelo-1.jpg",
          oznake: ["za dijeljenje"],
        },
        {
          naziv: "Burrata s rajčicom",
          opis: "Kremasta burrata, slatke rajčice, bosiljak i maslinovo ulje.",
          cijena: 10.00,
          slika: "slike/jela/predjelo-2.jpg",
          oznake: ["vegetarijansko"],
        },
        {
          naziv: "Bruschette s kozicama",
          opis: "Prepečeni kruh, marinirane kozice, češnjak i limun.",
          cijena: 11.50,
          slika: "slike/jela/predjelo-3.jpg",
          oznake: [],
        },
      ],
    },
    {
      naziv: "Glavna jela",
      stavke: [
        {
          naziv: "Crni rižoto od sipe",
          opis: "Tradicionalni rižoto od sipe, vino, češnjak i svježi peršin.",
          cijena: 18.00,
          slika: "slike/jela/glavno-1.jpg",
          oznake: ["specijalitet kuće"],
        },
        {
          naziv: "Brancin sa žara",
          opis: "File brancina, blitva s krumpirom i domaće maslinovo ulje.",
          cijena: 24.00,
          slika: "slike/jela/glavno-2.jpg",
          oznake: ["bez glutena"],
        },
        {
          naziv: "Pašticada s njokima",
          opis: "Spora kuhana govedina u aromatičnom umaku od vina i suhih šljiva.",
          cijena: 21.00,
          slika: "slike/jela/glavno-3.jpg",
          oznake: ["tradicionalno"],
        },
      ],
    },
    {
      naziv: "Deserti",
      stavke: [
        {
          naziv: "Domaća rožata",
          opis: "Kremasti dalmatinski puding s karamelom i narančom.",
          cijena: 6.50,
          slika: "slike/jela/desert-1.jpg",
          oznake: ["domaće"],
        },
        {
          naziv: "Torta od smokava",
          opis: "Biskvit od badema, smokve i lagana krema od vanilije.",
          cijena: 7.00,
          slika: "slike/jela/desert-2.jpg",
          oznake: [],
        },
      ],
    },
    {
      naziv: "Pića",
      stavke: [
        {
          naziv: "Kućno bijelo vino",
          opis: "Čaša vina lokalnog vinara, Posip ili Pošip.",
          cijena: 4.50,
          slika: "",
          oznake: [],
        },
        {
          naziv: "Limunada s mentom",
          opis: "Svježe cijeđeni limun, menta i malo meda.",
          cijena: 4.00,
          slika: "",
          oznake: ["bez alkohola"],
        },
      ],
    },
  ],

  // ---------- REZERVACIJA ----------
  rezervacija: {
    // Postavite na false da sekcija rezervacije potpuno nestane sa stranice i iz izbornika.
    ukljuceno: true,

    // Način rezervacije: "telefon", "whatsapp" ili "email"
    nacin: "whatsapp",

    // Broj za WhatsApp u međunarodnom formatu, bez razmaka i bez "+" (koristi se samo ako je nacin "whatsapp")
    whatsappBroj: "385998535380",

    // E-mail na koji stiže rezervacija (koristi se samo ako je nacin "email")
    emailZaRezervacije: "rezervacije@primjer.hr",
  },

  // ---------- GALERIJA ----------
  galerija: [
    "slike/galerija/1.jpg",
    "slike/galerija/2.jpg",
    "slike/galerija/3.jpg",
    "slike/galerija/4.jpg",
    "slike/galerija/5.jpg",
    "slike/galerija/6.jpg",
  ],

  // ---------- PODNOŽJE ----------
  podnozje: {
    tekst: "Sva prava pridržana.",
    autor: "Izradio David Vacka",
  },

};
