import Link from "next/link";
import Navbar from "../../components/Navbar";

const transcriptRows = [
  {
    swahili:
      "Tarehe 8 mwezi wa nne majira ya saa 2:55 za usiku huko hoteli ya Zuri iliyoko Nungwi wilaya ya kaskazini mkoa wa kaskazini Unguja.",
    english:
      "On April 8, at around 2:55 at night, at Zuri Hotel located in Nungwi District in the Northern Region of Unguja.",
  },
  {
    swahili:
      "Mwanamke ajulikanaye kwa jina la Ashlee Robinson miaka 31 raia wa Marekani ambaye alifikia kwenye hoteli hiyo ya Zuri katika shughuli zake za utalii akimiliki pasipoti namba 67920035.",
    english:
      "A woman known as Ashlee Robinson, aged 31, a citizen of the United States, who arrived at Zuri Hotel for tourism activities, possessing passport number 67920035.",
  },
  {
    swahili:
      "Alijaribu kujiua kwa kujinyonga kwa kutumia mkanda wa nguo rangi ya kijivu ambapo aliufunga mkanda huo katika kabati la nguo lililoko katika chumba namba 25.",
    english:
      "She attempted to take her own life by hanging using a gray clothing strap, which she tied inside the wardrobe located in Room 25.",
  },
  {
    swahili:
      "Mgeni huyo aliingia tarehe 4 mwezi wa nne 2026 akiwa na mchumba wake aitwaye Joseph Isaac McCann mwenye umri wa miaka 48, raia wa Marekani, ambaye naye alikuwa anaishi naye pamoja hapo kwenye hoteli ya Zuri na kwa mujibu wa taarifa zao walitarajiwa kuondoka tarehe 10 mwezi wa nne 2026.",
    english:
      "That guest arrived on April 4, 2026, with her partner, Joseph Isaac McCann, aged 48, a citizen of the United States, who was staying there with her at Zuri Hotel, and according to their information they were expected to leave on April 10, 2026.",
  },
  {
    swahili:
      "Siku ya tarehe 8 mwezi wa nne 2026 majira ya saa 12 za jioni kulitokea mgogoro wa kimapenzi baina ya watu hao wawili kwa maana huyu Ashlee pamoja na mpenzi wake Joseph.",
    english:
      "On April 8, 2026, at around 12 in the evening, a romantic dispute occurred between the two individuals, meaning Ashlee and her partner Joseph.",
  },
  {
    swahili:
      "Mgogoro huo baina ya watu hao wawili ulitambulika na jirani ambaye alikuwa anaishi chumba namba 24 na yeye akatoa taarifa kwa uongozi wa hoteli akieleza kwamba majirani zake wamekuwa wakizozana kwa siku hiyo ya tarehe nane.",
    english:
      "That dispute between the two individuals was identified by a neighbor staying in Room 24, and she reported it to hotel management, explaining that her neighbors had been arguing on that day, the 8th.",
  },
  {
    swahili:
      "Lakini akaeleza zaidi kwamba tangu wamefika hapo wamekuwa wakiwa na mizozo ya mara kwa mara na wakiwa wanagombezana hapo ndani ya hicho chumba chao.",
    english:
      "She further explained that since they arrived there, they had been having frequent conflicts and arguments inside that room.",
  },
  {
    swahili:
      "Uongozi wa hoteli baada ya kupata taarifa hiyo ulikwenda kuwaona na kuwauliza kama kuna changamoto zozote wanazopitia au walizonazo lakini baada ya kuona kweli hali inayojitokeza pale ni ya mizozo kati ya wawili hao, uongozi ukaamua ili kuweka hali ya utulivu na usalama kwenye ile hoteli na wageni wengine wasipate bugudha kumhamisha yule bwana aitwaye Joseph na kumpeleka kwenye eneo lingine ambalo ni chumba namba 65.",
    english:
      "After receiving that information, the hotel management went to see them and asked whether there were any challenges they were facing, but after seeing that the situation there was indeed a conflict between the two, management decided, in order to maintain peace and safety in the hotel and so that other guests would not be disturbed, to move the man named Joseph to another area, which was Room 65.",
  },
  {
    swahili:
      "Na nitoe ufafanuzi, nikizungumza chumba nazungumzia villa. Yaani ni nyumba zile ambazo zinakuwa ni self contained.",
    english:
      "And let me clarify, when I say room I am referring to a villa, meaning those self contained houses.",
  },
  {
    swahili:
      "Kwa hiyo ile ilikuwa namba 25 wakamhamisha yule bwana kumpeleka namba 65. Ni umbali wa kutembea kwa miguu kama dakika nane mpaka 10 kutoka hapo ambapo alikuwa awali kwenye hiyo nyumba namba 25.",
    english:
      "So that was number 25, and they moved the man to number 65. It is a walking distance of about eight to ten minutes from where he had originally been in house number 25.",
  },
  {
    swahili:
      "Baada ya muda kupita kipindi kama ya masaa mawili matatu kufika muda huo wa saa 2 na dakika 55 ndipo mmoja kati ya wahudumu wa vyumba ambaye mara kwa mara amekuwa akipita time za jioni kwa ajili ya kufanya huduma kama kupuliza dawa au kama kuna mtu ana changamoto yoyote anahitaji huduma ya kihoteli basi anaweza akasaidiwa.",
    english:
      "After some time had passed, a period of about two to three hours, reaching around 2:55 at night, one of the room attendants who usually passes through in the evening to provide services such as spraying or assisting anyone who has any issue and needs hotel service, came by.",
  },
  {
    swahili:
      "Mhudumu huyo alikwenda pale mapema kwanza majira ya saa 1:30 akakutana na mhusika kwa maana huyu Ashlee na kutaka kumuuliza kama anahitaji huduma yoyote.",
    english:
      "That attendant had gone there earlier at around 1:30 and met the individual, meaning Ashlee, and wanted to ask her whether she needed any service.",
  },
  {
    swahili:
      "Akamwambia kwamba nitahitaji huduma lakini naomba uje baada ya dakika 10. Lakini kwa sasa hivi naomba charger maana naona simu yangu chaji yake kidogo ina changamoto.",
    english:
      "She told him, I will need service, but please come back after ten minutes. But for now, I am asking for a charger because I see my phone battery has a bit of a problem.",
  },
  {
    swahili:
      "Yule mhudumu jina tunalihifadhi kwa sasa kwa sababu tunaendelea na uchunguzi.",
    english:
      "The attendant’s name is being withheld for now because the investigation is ongoing.",
  },
  {
    swahili:
      "Alichofanya yeye ni kumpa ile charger na kuendelea kutoa huduma kwa wateja wa vyumba vingine. Akaingia chumba namba 24, akaingia 26. Baadaye akaja kukumbuka kwamba ana ahadi ya kurudi tena kwenye chumba namba 25 ambacho Ashlee alikuwa anaishi.",
    english:
      "What he did was give her that charger and continue providing service to guests in other rooms. He entered Room 24, he entered 26, and later remembered that he had promised to return again to Room 25 where Ashlee was staying.",
  },
  {
    swahili:
      "Aliporudi tena baada ya kama dakika 20 akagonga ule mlango akakuta mlango haufunguki na hakuna mtu anayefungua lakini taa zote za ndani zikiwa zimezimwa.",
    english:
      "When he returned again after about 20 minutes, he knocked on the door and found that the door would not open and no one was opening it, while all the lights inside were off.",
  },
  {
    swahili:
      "Kwa kuwa yeye alikuwa ana ufunguo wa dharura pale anapotembea, akakuta mlango haufunguki basi alitumia ufunguo huo kufungua kuangalia ndani kuna nini.",
    english:
      "Since he had an emergency key while making his rounds, and found that the door was not opening, he used that key to open it and look inside to see what was there.",
  },
  {
    swahili:
      "Alipofungua akakuta kuna giza lakini alipofungua na kujaribu kufunga mlango ili aendelee kukagua zaidi ndani akasikia kama kishindo upande wa kushoto ambapo kuna makabati ya nguo.",
    english:
      "When he opened it, he found darkness, but after opening it and trying to close the door so that he could continue checking further inside, he heard a sound on the left side where the wardrobes were.",
  },
  {
    swahili:
      "Na alipoangalia akamuona huyu mgeni wa kike aitwaye Ashlee akiwa ananing'inia kwenye kabati kwa ndani kwa kutumia kamba ya nguo ya yale masweta ya kujihifadhia mle ndani.",
    english:
      "And when he looked, he saw the female guest named Ashlee hanging inside the wardrobe using a clothing cord from those garments kept inside.",
  },
  {
    swahili:
      "Kama ile ya kujifunga kiunoni tumboni lakini akafunga juu kwenye hanger zile pale kwenye hoteli, nadhani mnaona kwenye makabati kunakuwa na chuma ambacho kinakuwa na hanger kwa hiyo alifunga pale.",
    english:
      "Like the kind used for tying around the waist or stomach, but she tied it above to the hangers there in the hotel. I think you know that in wardrobes there is a metal bar with hangers, so she tied it there.",
  },
  {
    swahili:
      "Akamkuta pale akiwa anatapatapa akatoka mbio sasa huyu mhudumu kwenda kutoa taarifa na ndio uongozi wa hoteli ukafika pale haraka na kumshusha haraka ili kumpa huduma ya kwanza na kumpeleka hospitali ya jirani ili kupata huduma kwa haraka.",
    english:
      "He found her there struggling, and that attendant ran out to report it, and then the hotel management arrived there quickly and took her down quickly in order to give her first aid and take her to a nearby hospital to receive urgent treatment.",
  },
  {
    swahili:
      "Mara kupata huduma pale hospitali mhusika alihamishwa hospitali ya Ampola iliyopo mjini Magharibi kwa ajili ya matibabu zaidi.",
    english:
      "After receiving treatment there at the hospital, the individual was transferred to Ampola Hospital located in Mjini Magharibi for further treatment.",
  },
  {
    swahili:
      "Na wakati anaendelea kupata matibabu ilipofika tarehe 9 mwezi wa nne mwaka 2026 majira ya saa 9 mchana alifariki dunia akiwa bado anaendelea kupata matibabu.",
    english:
      "And while she was continuing to receive treatment, when it reached April 9, 2026, at around 9 in the afternoon, she died while still receiving treatment.",
  },
  {
    swahili:
      "Uchunguzi wa tukio hili bado unaendelea na hivi ninavyozungumza madaktari pamoja na wataalam wanaendelea kwenye hospitali ya Lumumba, hospitali ya serikali Lumumba, kufanya postmortem kwa maana ya kwamba uchunguzi wa kifo.",
    english:
      "The investigation into this incident is still ongoing, and as I speak, doctors together with specialists are continuing at Lumumba Hospital, Lumumba Government Hospital, to conduct a postmortem, meaning an examination of the death.",
  },
  {
    swahili:
      "Na pale ambapo taarifa kamili zitakapopatikana kutokana na ripoti hizo tutakuwa na uhakika wa kujua nini hasa kilitokea katika eneo la tukio na nini hasa kilisababisha mgeni huyu aitwaye Ashlee kufariki kwa kujinyonga.",
    english:
      "And when complete information is obtained from those reports, we will be certain to know exactly what happened at the scene and exactly what caused this guest named Ashlee to die by hanging.",
  },
  {
    swahili:
      "Ah nitoe wito kwa wanahabari na wananchi wote kwa ujumla, linapotokea tukio kama hili, naomba tujitahidi sana kupata taarifa sahihi kutoka kwa mamlaka husika badala ya kuchukua taarifa kutoka kwenye vyanzo ambavyo sio sahihi.",
    english:
      "Let me call upon journalists and all citizens in general, when an incident like this occurs, I ask that we make every effort to obtain accurate information from the responsible authorities instead of taking information from sources that are not accurate.",
  },
  {
    swahili:
      "Na hii inaweza ikaleta mtafaruku wa kuona kwamba kilichotokea pale hakifanani na kile ambacho wengine wanakifikiria.",
    english:
      "And this can create confusion by making it appear that what happened there does not match what others are thinking.",
  },
  {
    swahili:
      "Kwa hiyo mimi niseme tu jeshi la polisi kwa kushirikiana na hospitali ya Lumumba pamoja na idara nyingine za kisayansi tunaendelea na uchunguzi wa kupata ufumbuzi wa kujua ni nini kimetokea na pale ambapo itathibitika kuna jambo lolote la kijinai limetokea hatua zitachukuliwa dhidi ya mhusika.",
    english:
      "So let me say that the police force, in cooperation with Lumumba Hospital and other scientific departments, continues with the investigation to determine what happened, and where it is established that any criminal act occurred, action will be taken against the responsible person.",
  },
  {
    swahili:
      "Nikisema hivi, huyu mchumba wa marehemu bwana Joseph, tuko naye kwa mahojiano zaidi hivi ninavyozungumza timu ya wapelelezi inaendelea kufanya mahojiano naye kwa ajili ya kutaka kujua vile vile nini kimesibu pale.",
    english:
      "As I say this, the deceased’s partner, Mr. Joseph, is with us for further questioning, and as I speak the investigative team continues to interview him in order to understand what happened there as well.",
  },
  {
    swahili:
      "Lakini vile vile ninapozungumza kuhusiana na uchunguzi wa kifo cha marehemu, uchunguzi huu tunaufanya kwa kushirikiana na ndugu wa marehemu kwa maana ya kwamba wametuma mwakilishi taasisi maalum inayoshughulika na uchunguzi wa vifo kwa maana ya coroner.",
    english:
      "But also, as I speak regarding the investigation into the death of the deceased, we are conducting this investigation in cooperation with the relatives of the deceased, in the sense that they have sent a representative from a special institution that handles death investigations, meaning a coroner.",
  },
  {
    swahili:
      "Ambayo imepata authority au kibali kutoka ubalozi wa Marekani nchini Tanzania Dar es Salaam.",
    english:
      "Which has obtained authority or permission from the United States Embassy in Tanzania, Dar es Salaam.",
  },
  {
    swahili:
      "Na hiyo barua tumeiona na nakala ya barua hiyo imepelekwa mpaka hospitali ya serikali Lumumba kutoa mamlaka ambayo wamepewa kutoka kwa ndugu wa marehemu kwa hii taasisi kusimamia uchunguzi wa kifo cha marehemu.",
    english:
      "And we have seen that letter, and a copy of that letter has been delivered to Lumumba Government Hospital to provide the authority they have been given by the relatives of the deceased for that institution to oversee the investigation into the death of the deceased.",
  },
];

export default function AshleeTranscriptPage() {
  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar rightButtonLabel="Case Files" rightButtonHref="/case-file" />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Royal Authority TV
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            Zanzibar Police Press Conference
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Full source transcript for the Ashlee Robinson case press conference,
            presented in a dual-language archive format.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/transcript"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
          >
            ← Back to Transcript Archive
          </Link>

          <Link
            href="/case-file/ashlee"
            className="rounded-xl bg-[#C9A24A] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Open Related Case File
          </Link>
        </div>

        <section className="overflow-hidden rounded-[34px] border border-[#C9A24A]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-2xl shadow-black/30">
          <div className="border-b border-white/10 px-7 py-6 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  Transcript Entry 01
                </div>
                <h2 className="mt-2 font-serif text-2xl text-white md:text-3xl">
                  Ashlee Robinson Case Briefing
                </h2>
              </div>
              <div className="rounded-full border border-red-500/35 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-red-200">
                Full Transcript
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2">
            <div className="border-b border-white/10 px-7 py-4 text-xs uppercase tracking-[0.28em] text-[#E8D19A] md:border-b-0 md:border-r">
              Original Swahili
            </div>
            <div className="px-7 py-4 text-xs uppercase tracking-[0.28em] text-[#E8D19A]">
              Direct English Translation
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {transcriptRows.map((row, index) => (
              <div key={index} className="grid md:grid-cols-2">
                <div className="border-b border-white/10 px-7 py-5 text-sm leading-8 text-slate-200 md:border-b-0 md:border-r">
                  {row.swahili}
                </div>
                <div className="px-7 py-5 text-sm leading-8 text-slate-300">
                  {row.english}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}