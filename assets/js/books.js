// The shelf: one entry per textbook. Edit the words here; the art is drawn below.
// All art is original vector drawing in four inks. No organizer logos, ever.
window.SF = window.SF || {};

(function () {
  const I = '#141414', C = '#1F3FB0', V = '#C93A23', K = '#EFE7D3';

  function repeat(n, fn) {
    let out = '';
    for (let i = 0; i < n; i++) out += fn(i);
    return out;
  }

  const ART = {
    sat:
      '<g stroke="' + K + '" stroke-opacity=".28" stroke-width="2">' +
      repeat(9, (i) => '<path d="M' + (70 + i * 70) + ' 360V900"/>') +
      repeat(10, (i) => '<path d="M70 ' + (360 + i * 60) + 'H630"/>') + '</g>' +
      '<path d="M70 630H630M350 360V900" stroke="' + K + '" stroke-width="5"/>' +
      '<path d="M128 372Q350 1180 572 372" fill="none" stroke="' + V + '" stroke-width="30" stroke-linecap="round"/>' +
      '<path d="M120 364Q342 1172 564 364" fill="none" stroke="' + K + '" stroke-width="3"/>' +
      '<circle cx="350" cy="776" r="30" fill="' + K + '"/><circle cx="350" cy="776" r="12" fill="' + C + '"/>',

    ielts:
      '<rect x="70" y="350" width="270" height="265" fill="' + C + '"/>' +
      '<g fill="none" stroke="' + K + '" stroke-width="14" stroke-linecap="round"><path d="M125 515A60 60 0 0 1 185 575"/><path d="M125 465A110 110 0 0 1 235 575"/><path d="M125 415A160 160 0 0 1 285 575"/></g><circle cx="125" cy="575" r="17" fill="' + K + '"/>' +
      '<rect x="360" y="350" width="270" height="265" fill="' + I + '"/>' +
      '<path d="M385 415L495 445V570L385 540ZM605 415L495 445V570L605 540Z" fill="' + K + '"/>' +
      '<path d="M405 455L475 474M405 485L475 504M515 474L585 455M515 504L585 485" stroke="' + I + '" stroke-width="5"/>' +
      '<rect x="70" y="635" width="270" height="265" fill="' + V + '"/>' +
      '<path d="M205 875L150 745L170 670H240L260 745Z" fill="' + K + '"/><path d="M205 875V770" stroke="' + V + '" stroke-width="6"/><circle cx="205" cy="760" r="13" fill="' + V + '"/>' +
      '<rect x="361.500" y="636.500" width="267" height="262" fill="none" stroke="' + I + '" stroke-width="3"/>' +
      '<rect x="395" y="680" width="200" height="130" rx="28" fill="' + I + '"/><path d="M440 800V860L500 805Z" fill="' + I + '"/>' +
      '<circle cx="455" cy="745" r="11" fill="' + K + '"/><circle cx="495" cy="745" r="11" fill="' + K + '"/><circle cx="535" cy="745" r="11" fill="' + K + '"/>',

    toefl:
      '<circle cx="350" cy="625" r="250" fill="' + K + '"/>' +
      [60, 130, 220, 320, 180, 420, 280, 510, 280, 420, 180, 320, 220, 130, 60]
        .map((h, i) => '<rect x="' + (67 + i * 39) + '" y="' + (625 - h / 2) + '" width="22" height="' + h + '" rx="11" fill="' + (i === 7 ? C : I) + '"/>').join(''),

    det:
      '<rect x="170" y="350" width="360" height="285" fill="' + C + '" stroke="' + K + '" stroke-width="10"/>' +
      '<path d="M240 635a110 110 0 0 1 220 0z" fill="' + V + '"/>' +
      '<path d="M350 350V635M170 480H530" stroke="' + K + '" stroke-width="7"/>' +
      '<rect x="70" y="838" width="560" height="14" fill="' + K + '"/>' +
      '<rect x="235" y="685" width="230" height="140" rx="9" fill="' + K + '"/><rect x="250" y="700" width="200" height="110" fill="' + I + '"/>' +
      '<path d="M305 755L340 790L400 722" fill="none" stroke="' + V + '" stroke-width="14"/>' +
      '<rect x="200" y="825" width="300" height="13" fill="' + K + '"/>' +
      '<rect x="545" y="785" width="48" height="53" fill="' + V + '"/><path d="M569 785C535 745 545 715 569 690C593 715 603 745 569 785Z" fill="' + K + '"/>',

    imo:
      '<circle cx="350" cy="625" r="255" fill="none" stroke="' + I + '" stroke-width="8"/>' +
      '<path d="M271 382L112 718L581 733Z" fill="' + C + '"/>' +
      '<circle cx="302" cy="602" r="122" fill="' + V + '"/>' +
      '<path d="M271 382L302 602M112 718L302 602M581 733L302 602" stroke="' + K + '" stroke-width="4"/>' +
      '<circle cx="302" cy="602" r="9" fill="' + K + '"/>',

    ipho:
      '<rect x="240" y="345" width="220" height="11" fill="' + K + '"/>' +
      '<path d="M104 717A440 440 0 0 0 596 717" fill="none" stroke="' + K + '" stroke-width="3" stroke-dasharray="4 13"/>' +
      [[104, 717, .3], [221, 773, .45], [350, 792, .6], [479, 773, .8], [596, 717, 1]]
        .map((p, i) => '<path d="M350 352L' + p[0] + ' ' + p[1] + '" stroke="' + K + '" stroke-width="4" stroke-opacity="' + p[2] + '"/>' +
          '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === 4 ? 46 : 34) + '" fill="' + (i === 4 ? V : C) + '"/>').join(''),

    icho:
      '<path d="M227 660H473L560 850Q570 880 535 880H165Q130 880 140 850Z" fill="' + I + '"/>' +
      '<path d="M300 362V500L140 850Q130 880 165 880H535Q570 880 560 850L400 500V362" fill="none" stroke="' + K + '" stroke-width="13"/>' +
      '<rect x="282" y="348" width="136" height="18" fill="' + K + '"/>' +
      '<circle cx="300" cy="790" r="26" fill="' + K + '"/><circle cx="385" cy="735" r="16" fill="' + K + '"/><circle cx="430" cy="820" r="20" fill="' + K + '"/><circle cx="350" cy="610" r="13" fill="' + K + '"/><circle cx="345" cy="540" r="8" fill="' + K + '"/>' +
      '<path d="M570 400L622 430V490L570 520L518 490V430Z" fill="none" stroke="' + K + '" stroke-width="8"/><circle cx="570" cy="460" r="27" fill="none" stroke="' + K + '" stroke-width="5"/>',

    sof:
      '<text x="78" y="768" font-family="Literata,Georgia,serif" font-weight="700" font-size="470" fill="' + V + '">Aa</text>' +
      '<text x="66" y="756" font-family="Literata,Georgia,serif" font-weight="700" font-size="470" fill="' + K + '">Aa</text>' +
      '<path d="M70 828H630M70 858H470M70 888H560" stroke="' + K + '" stroke-width="5"/>',

    ap:
      [90, 180, 270, 360, 450].map((h, i) =>
        '<rect x="' + (70 + i * 112) + '" y="' + (890 - h) + '" width="110" height="' + h + '" fill="' + (i === 4 ? C : I) + '"/>' +
        '<text x="' + (125 + i * 112) + '" y="' + (890 - h + 62) + '" text-anchor="middle" font-family="Literata,Georgia,serif" font-weight="700" font-size="54" fill="' + K + '">' + (i + 1) + '</text>').join('') +
      '<circle cx="574" cy="392" r="36" fill="' + V + '"/>',

    csca:
      '<circle cx="430" cy="530" r="160" fill="' + V + '"/>' +
      '<path d="M70 770L230 520L360 680L480 570L630 770V890H70Z" fill="' + C + '"/>' +
      '<path d="M70 840L200 660L330 805L430 710L630 870V890H70Z" fill="' + K + '"/>',
  };

  // Small marks for the spines, drawn in a box from -40 to 40.
  function mark(id, fg, acc) {
    const m = {
      sat: '<path d="M-34 -34Q0 92 34 -34" fill="none" stroke="' + acc + '" stroke-width="9" stroke-linecap="round"/><circle cy="29" r="8" fill="' + fg + '"/>',
      ielts: '<rect x="-34" y="-34" width="31" height="31" fill="' + acc + '"/><rect x="3" y="-34" width="31" height="31" fill="' + fg + '"/><rect x="-34" y="3" width="31" height="31" fill="' + fg + '"/><rect x="3" y="3" width="31" height="31" fill="' + acc + '"/>',
      toefl: [24, 48, 70, 40, 20].map((h, i) => '<rect x="' + (-34 + i * 15) + '" y="' + (-h / 2) + '" width="9" height="' + h + '" rx="4.500" fill="' + fg + '"/>').join(''),
      det: '<rect x="-30" y="-28" width="60" height="42" rx="3" fill="' + fg + '"/><rect x="-40" y="16" width="80" height="7" fill="' + fg + '"/><path d="M-12 -8L-3 2L14 -16" fill="none" stroke="' + acc + '" stroke-width="6"/>',
      imo: '<circle r="35" fill="none" stroke="' + fg + '" stroke-width="4"/><path d="M-9 -33L-33 12L31 14Z" fill="' + acc + '"/>',
      ipho: '<rect x="-30" y="-38" width="60" height="5" fill="' + fg + '"/><path d="M0 -36L24 22" stroke="' + fg + '" stroke-width="3"/><circle cx="24" cy="24" r="13" fill="' + acc + '"/>',
      icho: '<path d="M-9 -36V-8L-32 34H32L9 -8V-36" fill="none" stroke="' + fg + '" stroke-width="6"/><path d="M-18 10H18L28 30H-28Z" fill="' + fg + '"/>',
      sof: '<text y="27" text-anchor="middle" font-family="Literata,Georgia,serif" font-weight="700" font-size="76" fill="' + fg + '">A</text>',
      ap: '<rect x="-34" y="14" width="20" height="20" fill="' + fg + '"/><rect x="-11" y="-6" width="20" height="40" fill="' + fg + '"/><rect x="12" y="-26" width="20" height="60" fill="' + acc + '"/>',
      csca: '<circle cx="8" cy="-10" r="22" fill="' + acc + '"/><path d="M-38 32L-12 -6L6 16L18 4L38 32Z" fill="' + fg + '"/>',
    };
    return m[id];
  }

  SF.BOOKS = [
    {
      id: 'sat', tab: 'sat', exam: 'SAT', code: 'SAT', size: 230, tag: 'цифровой тест',
      bg: C, fg: K, acc: V,
      title: 'Цифровой SAT',
      sub: 'Digital SAT / вузы США и не только',
      note: '98 вопросов · 2 ч 14 мин · шкала 400–1600',
      meta: '2 секции / 98 вопросов / 2 ч 14 мин',
      text: 'Reading & Writing и Math в приложении Bluebook. Второй модуль подстраивается под первый, штрафа за ошибки нет, а в Math встроен калькулятор Desmos. Звучит страшнее, чем выглядит: почти всё для подготовки лежит бесплатно у самих организаторов.',
      credit: 'С него удобно начинать: на сайте уже есть маршрут на 12 недель.',
      route: true,
    },
    {
      id: 'ielts', tab: 'en', exam: 'IELTS', code: 'IELTS', size: 200, tag: 'четыре навыка',
      bg: K, fg: I, acc: V,
      title: 'IELTS',
      sub: 'Academic / английский для вузов',
      note: '4 секции · шкала 1–9',
      meta: 'Listening / Reading / Writing / Speaking',
      text: 'Четыре навыка за один экзамен. Можно сдавать на компьютере, но Speaking всё равно проходит вживую с экзаменатором. Поговорить с незнакомым взрослым про любимое время года тоже навык, и он отлично тренируется.',
      credit: 'Письмо сложнее всего проверить бесплатно, поэтому начни с Write & Improve.',
    },
    {
      id: 'toefl', tab: 'en', exam: 'TOEFL', code: 'TOEFL', size: 200, tag: 'формат 2026',
      bg: V, fg: K, acc: I,
      title: 'TOEFL iBT',
      sub: 'Новый формат с января 2026',
      note: '4 секции · около 2 часов · шкала 1–6',
      meta: '4 секции / около 2 часов / шкала 1–6',
      text: 'С января 2026 тест изменился: он подстраивается под ответы, а общий балл идёт по шкале 1–6. Ещё два года рядом показывают привычную шкалу 0–120. Сдавать можно в центре или из дома под присмотром живого наблюдателя.',
      credit: 'Осторожно: многие «бесплатные тесты» в сети сделаны под старый формат.',
    },
    {
      id: 'det', tab: 'en', exam: 'DET', code: 'DET', size: 230, tag: 'онлайн из дома',
      bg: I, fg: K, acc: V,
      title: 'Duolingo English Test',
      sub: 'DET / запасной английский',
      note: 'Онлайн · из дома · без фиксированных дат',
      meta: 'Онлайн / из дома / без фиксированных дат',
      text: 'Адаптивный тест, который сдаётся из дома, когда удобно. Звучит как мечта, поэтому главное правило одно: сначала проверь, принимает ли его твой вуз. Многие принимают, но далеко не все.',
      credit: 'Хороший запасной вариант, если до центра IELTS или TOEFL далеко.',
    },
    {
      id: 'imo', tab: 'olymp', exam: 'IMO', code: 'IMO', size: 230, tag: 'математика',
      bg: K, fg: I, acc: C,
      title: 'Олимпиада по математике',
      sub: 'IMO / International Mathematical Olympiad',
      note: 'Будапешт · 16–26 июля 2027',
      meta: '6 задач / 2 дня / Будапешт, июль 2027',
      text: 'Шесть задач за два дня. До финала идут через национальные отборы, поэтому начинать лучше с архивов и разминочных олимпиад, а не с самых страшных задач. Задача, которая не решается третий вечер подряд, здесь обычное дело.',
      credit: 'Вес олимпиады при поступлении зависит от вуза: смотри требования заранее.',
    },
    {
      id: 'ipho', tab: 'olymp', exam: 'IPhO', code: 'IPhO', size: 210, tag: 'физика',
      bg: I, fg: K, acc: V,
      title: 'Олимпиада по физике',
      sub: 'IPhO / International Physics Olympiad',
      note: 'Теория и эксперимент · даты 2027 не подтверждены',
      meta: 'Теоретический тур / экспериментальный тур',
      text: 'Два тура: теория и эксперимент. Официальный syllabus показывает, что вообще могут спросить, а прошлые задачи и конспекты дают почувствовать уровень. Страну и даты 2027 года источники называют по-разному, так что сверяйся с календарём.',
      credit: 'Не хватай всё сразу: одна тема до конца полезнее пяти начатых.',
    },
    {
      id: 'icho', tab: 'olymp', exam: 'IChO', code: 'IChO', size: 210, tag: 'химия',
      bg: V, fg: K, acc: I,
      title: 'Олимпиада по химии',
      sub: 'IChO / International Chemistry Olympiad',
      note: 'Теория и практика · даты 2027 не подтверждены',
      meta: 'Теоретический тур / практический тур',
      text: 'Теоретический и практический туры. Подготовительные задачи разных лет лежат в открытом доступе, с них удобно начинать: они обычно мягче финальных. Хотя слово «мягче» тут относительное.',
      credit: 'Материалы бери по ссылкам: у части пособий пометка «не для продажи».',
    },
    {
      id: 'sof', tab: 'olymp', exam: 'Английский (SOF)', code: 'SOF', size: 230, tag: 'английский',
      bg: C, fg: K, acc: V,
      title: 'Олимпиада по английскому',
      sub: 'SOF IEO / International English Olympiad',
      note: 'Школьная олимпиада платформы SOF',
      meta: 'Школьный формат / через школу',
      text: 'Школьная олимпиада платформы SOF. Хорошая разминка, но не международный финал уровня IMO, так что в заявке описывай её честно. И не перепутай: аббревиатура IEO есть ещё у экономической олимпиады.',
      credit: 'Бесплатно здесь только один прошлый вариант, остальные платные.',
    },
    {
      id: 'ap', tab: 'ap', exam: 'AP', code: 'AP', size: 240, tag: 'по предметам',
      bg: K, fg: I, acc: V,
      title: 'AP-экзамены',
      sub: 'Advanced Placement / по предметам',
      note: 'Май 2027 · баллы 1–5',
      meta: 'По предметам / баллы 1–5 / май 2027',
      text: 'Отдельный экзамен по каждому предмету, оценка от 1 до 5. Вопросы прошлых лет с критериями лежат на AP Central. Самое сложное тут часто не задания, а организация: как сдать AP из твоей страны, зависит от школы или центра, и это я пока не проверял.',
      credit: 'Начни с вопроса: где ближайшая школа, которая принимает внешних участников?',
    },
    {
      id: 'csca', tab: 'csca', exam: 'CSCA', code: 'CSCA', size: 210, tag: 'учёба в Китае',
      bg: I, fg: K, acc: V,
      title: 'CSCA: учёба в Китае',
      sub: 'China Scholastic Competency Assessment',
      note: 'Шесть сессий до июня 2027',
      meta: '4 предмета / 6 сессий / на китайском или английском',
      text: 'Экзамен для поступления в вузы Китая: профессиональный китайский, математика, физика и химия. До июня 2027 запланировано шесть сессий, а окно регистрации у них короткое, так что поглядывай на csca.cn.',
      credit: 'Материалов на русском я пока не нашёл. Если найдёшь, это настоящая находка.',
    },
  ];

  SF.TABS = [
    { key: 'all', label: 'Все / All' },
    { key: 'sat', label: 'SAT' },
    { key: 'en', label: 'Английский' },
    { key: 'olymp', label: 'Олимпиады' },
    { key: 'ap', label: 'AP' },
    { key: 'csca', label: 'CSCA' },
  ];

  function coverSymbol(b, i) {
    const number = '№ ' + String(i + 1).padStart(2, '0');
    return '<symbol id="cv-' + b.id + '" viewBox="0 0 700 1000">' +
      '<rect width="700" height="1000" fill="' + b.bg + '"/>' + ART[b.id] +
      '<rect x="34" width="3" height="1000" fill="#000" opacity=".2"/><rect x="37" width="2" height="1000" fill="#fff" opacity=".14"/>' +
      '<text x="70" y="88" font-family="Inter Tight,system-ui,sans-serif" font-weight="600" font-size="21" letter-spacing="3" fill="' + b.fg + '">НЕЗАВИСИМЫЙ НАВИГАТОР</text>' +
      '<text transform="translate(66 266) scale(.88 1)" font-family="Literata,Georgia,serif" font-weight="700" font-size="' + b.size + '" fill="' + b.fg + '">' + b.code + '</text>' +
      '<text x="72" y="322" font-family="Literata,Georgia,serif" font-style="italic" font-size="31" fill="' + b.fg + '">' + b.tag + '</text>' +
      '<text x="72" y="962" font-family="Inter Tight,system-ui,sans-serif" font-weight="600" font-size="21" letter-spacing="1" fill="' + b.fg + '">scoreforge.lab</text>' +
      '<rect x="552" y="934" width="96" height="38" fill="none" stroke="' + b.fg + '" stroke-width="2.500"/>' +
      '<text x="600" y="961" text-anchor="middle" font-family="Inter Tight,system-ui,sans-serif" font-weight="600" font-size="21" fill="' + b.fg + '">' + number + '</text>' +
      '</symbol>';
  }

  function spineSymbol(b, i) {
    return '<symbol id="sp-' + b.id + '" viewBox="0 0 140 1000" preserveAspectRatio="none">' +
      '<rect width="140" height="1000" fill="' + b.bg + '"/>' +
      '<rect y="38" width="140" height="7" fill="' + b.fg + '"/><rect y="54" width="140" height="2" fill="' + b.fg + '"/>' +
      '<rect y="944" width="140" height="2" fill="' + b.fg + '"/><rect y="955" width="140" height="7" fill="' + b.fg + '"/>' +
      '<g transform="translate(70 124)">' + mark(b.id, b.fg, b.acc) + '</g>' +
      '<text transform="translate(38 196) rotate(90)" font-family="Literata,Georgia,serif" font-weight="700" font-size="88" fill="' + b.fg + '">' + b.code + '</text>' +
      '<text transform="translate(62 862) rotate(90)" text-anchor="end" font-family="Literata,Georgia,serif" font-style="italic" font-size="30" fill="' + b.fg + '">' + b.tag + '</text>' +
      '<text x="70" y="925" text-anchor="middle" font-family="Inter Tight,system-ui,sans-serif" font-weight="600" font-size="22" fill="' + b.fg + '">№' + String(i + 1).padStart(2, '0') + '</text>' +
      '</symbol>';
  }

  // One hidden sprite holds every cover and spine, so the shelf copies stay light.
  SF.bookSprite = function () {
    return '<svg class="sprite" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false">' +
      SF.BOOKS.map((b, i) => coverSymbol(b, i) + spineSymbol(b, i)).join('') + '</svg>';
  };
})();
