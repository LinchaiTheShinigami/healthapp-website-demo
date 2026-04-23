(function () {
  const auth = window.AyutaAuth;
  if (!auth) return;

  const elements = {
    locked: document.getElementById('profile-locked'),
    lockedStatus: document.getElementById('profile-locked-status'),
    authenticated: document.getElementById('profile-authenticated'),
    displayName: document.getElementById('profile-display-name'),
    note: document.getElementById('profile-note'),
    verifiedBadge: document.getElementById('profile-verified-badge'),
    nameInput: document.getElementById('profile-name-input'),
    emailInput: document.getElementById('profile-email-input'),
    phoneInput: document.getElementById('profile-phone-input'),
    phonePrefix: document.getElementById('profile-phone-prefix'),
    phoneFlag: document.getElementById('profile-phone-flag'),
  };

  // Per-country data keyed by ISO 3166-1 alpha-2 code
  const COUNTRY_DATA = {
    AF:{flag:'\uD83C\uDDE6\uD83C\uDDEB',prefix:'+93'},  AL:{flag:'\uD83C\uDDE6\uD83C\uDDF1',prefix:'+355'}, DZ:{flag:'\uD83C\uDDE9\uD83C\uDDFF',prefix:'+213'}, AD:{flag:'\uD83C\uDDE6\uD83C\uDDE9',prefix:'+376'},
    AO:{flag:'\uD83C\uDDE6\uD83C\uDDF4',prefix:'+244'}, AR:{flag:'\uD83C\uDDE6\uD83C\uDDF7',prefix:'+54'},  AM:{flag:'\uD83C\uDDE6\uD83C\uDDF2',prefix:'+374'}, AU:{flag:'\uD83C\uDDE6\uD83C\uDDFA',prefix:'+61'},
    AT:{flag:'\uD83C\uDDE6\uD83C\uDDF9',prefix:'+43'},  AZ:{flag:'\uD83C\uDDE6\uD83C\uDDFF',prefix:'+994'}, BH:{flag:'\uD83C\uDDE7\uD83C\uDDED',prefix:'+973'}, BD:{flag:'\uD83C\uDDE7\uD83C\uDDE9',prefix:'+880'},
    BY:{flag:'\uD83C\uDDE7\uD83C\uDDFE',prefix:'+375'}, BE:{flag:'\uD83C\uDDE7\uD83C\uDDEA',prefix:'+32'},  BZ:{flag:'\uD83C\uDDE7\uD83C\uDDFF',prefix:'+501'}, BJ:{flag:'\uD83C\uDDE7\uD83C\uDDEF',prefix:'+229'},
    BT:{flag:'\uD83C\uDDE7\uD83C\uDDF9',prefix:'+975'}, BO:{flag:'\uD83C\uDDE7\uD83C\uDDF4',prefix:'+591'}, BA:{flag:'\uD83C\uDDE7\uD83C\uDDE6',prefix:'+387'}, BW:{flag:'\uD83C\uDDE7\uD83C\uDDFC',prefix:'+267'},
    BR:{flag:'\uD83C\uDDE7\uD83C\uDDF7',prefix:'+55'},  BN:{flag:'\uD83C\uDDE7\uD83C\uDDF3',prefix:'+673'}, BG:{flag:'\uD83C\uDDE7\uD83C\uDDEC',prefix:'+359'}, BF:{flag:'\uD83C\uDDE7\uD83C\uDDEB',prefix:'+226'},
    BI:{flag:'\uD83C\uDDE7\uD83C\uDDEE',prefix:'+257'}, KH:{flag:'\uD83C\uDDF0\uD83C\uDDED',prefix:'+855'}, CM:{flag:'\uD83C\uDDE8\uD83C\uDDF2',prefix:'+237'}, CA:{flag:'\uD83C\uDDE8\uD83C\uDDE6',prefix:'+1'},
    CV:{flag:'\uD83C\uDDE8\uD83C\uDDFB',prefix:'+238'}, CF:{flag:'\uD83C\uDDE8\uD83C\uDDEB',prefix:'+236'}, TD:{flag:'\uD83C\uDDF9\uD83C\uDDE9',prefix:'+235'}, CL:{flag:'\uD83C\uDDE8\uD83C\uDDF1',prefix:'+56'},
    CN:{flag:'\uD83C\uDDE8\uD83C\uDDF3',prefix:'+86'},  CO:{flag:'\uD83C\uDDE8\uD83C\uDDF4',prefix:'+57'},  KM:{flag:'\uD83C\uDDF0\uD83C\uDDF2',prefix:'+269'}, CG:{flag:'\uD83C\uDDE8\uD83C\uDDEC',prefix:'+242'},
    CD:{flag:'\uD83C\uDDE8\uD83C\uDDE9',prefix:'+243'}, CR:{flag:'\uD83C\uDDE8\uD83C\uDDF7',prefix:'+506'}, CI:{flag:'\uD83C\uDDE8\uD83C\uDDEE',prefix:'+225'}, HR:{flag:'\uD83C\uDDED\uD83C\uDDF7',prefix:'+385'},
    CU:{flag:'\uD83C\uDDE8\uD83C\uDDFA',prefix:'+53'},  CY:{flag:'\uD83C\uDDE8\uD83C\uDDFE',prefix:'+357'}, CZ:{flag:'\uD83C\uDDE8\uD83C\uDDFF',prefix:'+420'}, DK:{flag:'\uD83C\uDDE9\uD83C\uDDF0',prefix:'+45'},
    DJ:{flag:'\uD83C\uDDE9\uD83C\uDDEF',prefix:'+253'}, DO:{flag:'\uD83C\uDDE9\uD83C\uDDF4',prefix:'+1'},   EC:{flag:'\uD83C\uDDEA\uD83C\uDDE8',prefix:'+593'}, EG:{flag:'\uD83C\uDDEA\uD83C\uDDEC',prefix:'+20'},
    SV:{flag:'\uD83C\uDDF8\uD83C\uDDFB',prefix:'+503'}, GQ:{flag:'\uD83C\uDDEC\uD83C\uDDF6',prefix:'+240'}, ER:{flag:'\uD83C\uDDEA\uD83C\uDDF7',prefix:'+291'}, EE:{flag:'\uD83C\uDDEA\uD83C\uDDEA',prefix:'+372'},
    SZ:{flag:'\uD83C\uDDF8\uD83C\uDDFF',prefix:'+268'}, ET:{flag:'\uD83C\uDDEA\uD83C\uDDF9',prefix:'+251'}, FJ:{flag:'\uD83C\uDDEB\uD83C\uDDEF',prefix:'+679'}, FI:{flag:'\uD83C\uDDEB\uD83C\uDDEE',prefix:'+358'},
    FR:{flag:'\uD83C\uDDEB\uD83C\uDDF7',prefix:'+33'},  GA:{flag:'\uD83C\uDDEC\uD83C\uDDE6',prefix:'+241'}, GM:{flag:'\uD83C\uDDEC\uD83C\uDDF2',prefix:'+220'}, GE:{flag:'\uD83C\uDDEC\uD83C\uDDEA',prefix:'+995'},
    DE:{flag:'\uD83C\uDDE9\uD83C\uDDEA',prefix:'+49'},  GH:{flag:'\uD83C\uDDEC\uD83C\uDDED',prefix:'+233'}, GR:{flag:'\uD83C\uDDEC\uD83C\uDDF7',prefix:'+30'},  GT:{flag:'\uD83C\uDDEC\uD83C\uDDF9',prefix:'+502'},
    GN:{flag:'\uD83C\uDDEC\uD83C\uDDF3',prefix:'+224'}, GW:{flag:'\uD83C\uDDEC\uD83C\uDDFC',prefix:'+245'}, GY:{flag:'\uD83C\uDDEC\uD83C\uDDFE',prefix:'+592'}, HT:{flag:'\uD83C\uDDED\uD83C\uDDF9',prefix:'+509'},
    HN:{flag:'\uD83C\uDDED\uD83C\uDDF3',prefix:'+504'}, HK:{flag:'\uD83C\uDDED\uD83C\uDDF0',prefix:'+852'}, HU:{flag:'\uD83C\uDDED\uD83C\uDDFA',prefix:'+36'},  IS:{flag:'\uD83C\uDDEE\uD83C\uDDF8',prefix:'+354'},
    IN:{flag:'\uD83C\uDDEE\uD83C\uDDF3',prefix:'+91'},  ID:{flag:'\uD83C\uDDEE\uD83C\uDDE9',prefix:'+62'},  IR:{flag:'\uD83C\uDDEE\uD83C\uDDF7',prefix:'+98'},  IQ:{flag:'\uD83C\uDDEE\uD83C\uDDF6',prefix:'+964'},
    IE:{flag:'\uD83C\uDDEE\uD83C\uDDEA',prefix:'+353'}, IL:{flag:'\uD83C\uDDEE\uD83C\uDDF1',prefix:'+972'}, IT:{flag:'\uD83C\uDDEE\uD83C\uDDF9',prefix:'+39'},  JM:{flag:'\uD83C\uDDEF\uD83C\uDDF2',prefix:'+1'},
    JP:{flag:'\uD83C\uDDEF\uD83C\uDDF5',prefix:'+81'},  JO:{flag:'\uD83C\uDDEF\uD83C\uDDF4',prefix:'+962'}, KZ:{flag:'\uD83C\uDDF0\uD83C\uDDFF',prefix:'+7'},   KE:{flag:'\uD83C\uDDF0\uD83C\uDDEA',prefix:'+254'},
    KI:{flag:'\uD83C\uDDF0\uD83C\uDDEE',prefix:'+686'}, XK:{flag:'\uD83C\uDDFD\uD83C\uDDF0',prefix:'+383'}, KW:{flag:'\uD83C\uDDF0\uD83C\uDDFC',prefix:'+965'}, KG:{flag:'\uD83C\uDDF0\uD83C\uDDEC',prefix:'+996'},
    LA:{flag:'\uD83C\uDDF1\uD83C\uDDE6',prefix:'+856'}, LV:{flag:'\uD83C\uDDF1\uD83C\uDDFB',prefix:'+371'}, LB:{flag:'\uD83C\uDDF1\uD83C\uDDE7',prefix:'+961'}, LS:{flag:'\uD83C\uDDF1\uD83C\uDDF8',prefix:'+266'},
    LR:{flag:'\uD83C\uDDF1\uD83C\uDDF7',prefix:'+231'}, LY:{flag:'\uD83C\uDDF1\uD83C\uDDFE',prefix:'+218'}, LI:{flag:'\uD83C\uDDF1\uD83C\uDDEE',prefix:'+423'}, LT:{flag:'\uD83C\uDDF1\uD83C\uDDF9',prefix:'+370'},
    LU:{flag:'\uD83C\uDDF1\uD83C\uDDFA',prefix:'+352'}, MO:{flag:'\uD83C\uDDF2\uD83C\uDDF4',prefix:'+853'}, MG:{flag:'\uD83C\uDDF2\uD83C\uDDEC',prefix:'+261'}, MW:{flag:'\uD83C\uDDF2\uD83C\uDDFC',prefix:'+265'},
    MY:{flag:'\uD83C\uDDF2\uD83C\uDDFE',prefix:'+60'},  MV:{flag:'\uD83C\uDDF2\uD83C\uDDFB',prefix:'+960'}, ML:{flag:'\uD83C\uDDF2\uD83C\uDDF1',prefix:'+223'}, MT:{flag:'\uD83C\uDDF2\uD83C\uDDF9',prefix:'+356'},
    MH:{flag:'\uD83C\uDDF2\uD83C\uDDED',prefix:'+692'}, MR:{flag:'\uD83C\uDDF2\uD83C\uDDF7',prefix:'+222'}, MU:{flag:'\uD83C\uDDF2\uD83C\uDDFA',prefix:'+230'}, MX:{flag:'\uD83C\uDDF2\uD83C\uDDFD',prefix:'+52'},
    FM:{flag:'\uD83C\uDDEB\uD83C\uDDF2',prefix:'+691'}, MD:{flag:'\uD83C\uDDF2\uD83C\uDDE9',prefix:'+373'}, MC:{flag:'\uD83C\uDDF2\uD83C\uDDE8',prefix:'+377'}, MN:{flag:'\uD83C\uDDF2\uD83C\uDDF3',prefix:'+976'},
    ME:{flag:'\uD83C\uDDF2\uD83C\uDDEA',prefix:'+382'}, MA:{flag:'\uD83C\uDDF2\uD83C\uDDE6',prefix:'+212'}, MZ:{flag:'\uD83C\uDDF2\uD83C\uDDFF',prefix:'+258'}, MM:{flag:'\uD83C\uDDF2\uD83C\uDDF2',prefix:'+95'},
    NA:{flag:'\uD83C\uDDF3\uD83C\uDDE6',prefix:'+264'}, NP:{flag:'\uD83C\uDDF3\uD83C\uDDF5',prefix:'+977'}, NL:{flag:'\uD83C\uDDF3\uD83C\uDDF1',prefix:'+31'},  NZ:{flag:'\uD83C\uDDF3\uD83C\uDDFF',prefix:'+64'},
    NI:{flag:'\uD83C\uDDF3\uD83C\uDDEE',prefix:'+505'}, NE:{flag:'\uD83C\uDDF3\uD83C\uDDEA',prefix:'+227'}, NG:{flag:'\uD83C\uDDF3\uD83C\uDDEC',prefix:'+234'}, KP:{flag:'\uD83C\uDDF0\uD83C\uDDF5',prefix:'+850'},
    MK:{flag:'\uD83C\uDDF2\uD83C\uDDF0',prefix:'+389'}, NO:{flag:'\uD83C\uDDF3\uD83C\uDDF4',prefix:'+47'},  OM:{flag:'\uD83C\uDDF4\uD83C\uDDF2',prefix:'+968'}, PK:{flag:'\uD83C\uDDF5\uD83C\uDDF0',prefix:'+92'},
    PW:{flag:'\uD83C\uDDF5\uD83C\uDDFC',prefix:'+680'}, PS:{flag:'\uD83C\uDDF5\uD83C\uDDF8',prefix:'+970'}, PA:{flag:'\uD83C\uDDF5\uD83C\uDDE6',prefix:'+507'}, PG:{flag:'\uD83C\uDDF5\uD83C\uDDEC',prefix:'+675'},
    PY:{flag:'\uD83C\uDDF5\uD83C\uDDFE',prefix:'+595'}, PE:{flag:'\uD83C\uDDF5\uD83C\uDDEA',prefix:'+51'},  PH:{flag:'\uD83C\uDDF5\uD83C\uDDED',prefix:'+63'},  PL:{flag:'\uD83C\uDDF5\uD83C\uDDF1',prefix:'+48'},
    PT:{flag:'\uD83C\uDDF5\uD83C\uDDF9',prefix:'+351'}, QA:{flag:'\uD83C\uDDF6\uD83C\uDDE6',prefix:'+974'}, RO:{flag:'\uD83C\uDDF7\uD83C\uDDF4',prefix:'+40'},  RU:{flag:'\uD83C\uDDF7\uD83C\uDDFA',prefix:'+7'},
    RW:{flag:'\uD83C\uDDF7\uD83C\uDDFC',prefix:'+250'}, WS:{flag:'\uD83C\uDDFC\uD83C\uDDF8',prefix:'+685'}, SA:{flag:'\uD83C\uDDF8\uD83C\uDDE6',prefix:'+966'}, SN:{flag:'\uD83C\uDDF8\uD83C\uDDF3',prefix:'+221'},
    RS:{flag:'\uD83C\uDDF7\uD83C\uDDF8',prefix:'+381'}, SC:{flag:'\uD83C\uDDF8\uD83C\uDDE8',prefix:'+248'}, SL:{flag:'\uD83C\uDDF8\uD83C\uDDF1',prefix:'+232'}, SG:{flag:'\uD83C\uDDF8\uD83C\uDDEC',prefix:'+65'},
    SK:{flag:'\uD83C\uDDF8\uD83C\uDDF0',prefix:'+421'}, SI:{flag:'\uD83C\uDDF8\uD83C\uDDEE',prefix:'+386'}, SB:{flag:'\uD83C\uDDF8\uD83C\uDDE7',prefix:'+677'}, SO:{flag:'\uD83C\uDDF8\uD83C\uDDF4',prefix:'+252'},
    ZA:{flag:'\uD83C\uDDFF\uD83C\uDDE6',prefix:'+27'},  KR:{flag:'\uD83C\uDDF0\uD83C\uDDF7',prefix:'+82'},  SS:{flag:'\uD83C\uDDF8\uD83C\uDDF8',prefix:'+211'}, ES:{flag:'\uD83C\uDDEA\uD83C\uDDF8',prefix:'+34'},
    LK:{flag:'\uD83C\uDDF1\uD83C\uDDF0',prefix:'+94'},  SD:{flag:'\uD83C\uDDF8\uD83C\uDDE9',prefix:'+249'}, SR:{flag:'\uD83C\uDDF8\uD83C\uDDF7',prefix:'+597'}, SE:{flag:'\uD83C\uDDF8\uD83C\uDDEA',prefix:'+46'},
    CH:{flag:'\uD83C\uDDE8\uD83C\uDDED',prefix:'+41'},  SY:{flag:'\uD83C\uDDF8\uD83C\uDDFE',prefix:'+963'}, TW:{flag:'\uD83C\uDDF9\uD83C\uDDFC',prefix:'+886'}, TJ:{flag:'\uD83C\uDDF9\uD83C\uDDEF',prefix:'+992'},
    TZ:{flag:'\uD83C\uDDF9\uD83C\uDDFF',prefix:'+255'}, TH:{flag:'\uD83C\uDDF9\uD83C\uDDED',prefix:'+66'},  TL:{flag:'\uD83C\uDDF9\uD83C\uDDF1',prefix:'+670'}, TG:{flag:'\uD83C\uDDF9\uD83C\uDDEC',prefix:'+228'},
    TO:{flag:'\uD83C\uDDF9\uD83C\uDDF4',prefix:'+676'}, TT:{flag:'\uD83C\uDDF9\uD83C\uDDF9',prefix:'+1'},   TN:{flag:'\uD83C\uDDF9\uD83C\uDDF3',prefix:'+216'}, TR:{flag:'\uD83C\uDDF9\uD83C\uDDF7',prefix:'+90'},
    TM:{flag:'\uD83C\uDDF9\uD83C\uDDF2',prefix:'+993'}, TV:{flag:'\uD83C\uDDF9\uD83C\uDDFB',prefix:'+688'}, UG:{flag:'\uD83C\uDDFA\uD83C\uDDEC',prefix:'+256'}, UA:{flag:'\uD83C\uDDFA\uD83C\uDDE6',prefix:'+380'},
    AE:{flag:'\uD83C\uDDE6\uD83C\uDDEA',prefix:'+971'}, GB:{flag:'\uD83C\uDDEC\uD83C\uDDE7',prefix:'+44'},  US:{flag:'\uD83C\uDDFA\uD83C\uDDF8',prefix:'+1'},   UY:{flag:'\uD83C\uDDFA\uD83C\uDDFE',prefix:'+598'},
    UZ:{flag:'\uD83C\uDDFA\uD83C\uDDFF',prefix:'+998'}, VU:{flag:'\uD83C\uDDFB\uD83C\uDDFA',prefix:'+678'}, VE:{flag:'\uD83C\uDDFB\uD83C\uDDEA',prefix:'+58'},  VN:{flag:'\uD83C\uDDFB\uD83C\uDDF3',prefix:'+84'},
    YE:{flag:'\uD83C\uDDFE\uD83C\uDDEA',prefix:'+967'}, ZM:{flag:'\uD83C\uDDFF\uD83C\uDDF2',prefix:'+260'}, ZW:{flag:'\uD83C\uDDFF\uD83C\uDDFC',prefix:'+263'},
  };

  // Prefix → ISO mapping, 3-digit codes before 2-digit before 1-digit (longest-match)
  const PREFIX_TO_ISO = [
    ['+998','UZ'],['+996','KG'],['+995','GE'],['+994','AZ'],['+993','TM'],['+992','TJ'],
    ['+977','NP'],['+976','MN'],['+975','BT'],['+974','QA'],['+973','BH'],['+972','IL'],
    ['+971','AE'],['+970','PS'],['+968','OM'],['+967','YE'],['+966','SA'],['+965','KW'],
    ['+964','IQ'],['+963','SY'],['+962','JO'],['+961','LB'],['+960','MV'],
    ['+886','TW'],['+880','BD'],['+856','LA'],['+855','KH'],['+853','MO'],['+852','HK'],['+850','KP'],
    ['+692','MH'],['+691','FM'],['+688','TV'],['+686','KI'],['+685','WS'],['+680','PW'],
    ['+679','FJ'],['+678','VU'],['+677','SB'],['+676','TO'],['+675','PG'],['+673','BN'],['+670','TL'],
    ['+598','UY'],['+597','SR'],['+595','PY'],['+593','EC'],['+592','GY'],['+591','BO'],
    ['+509','HT'],['+507','PA'],['+506','CR'],['+505','NI'],['+504','HN'],['+503','SV'],['+502','GT'],['+501','BZ'],
    ['+423','LI'],['+421','SK'],['+420','CZ'],
    ['+389','MK'],['+387','BA'],['+386','SI'],['+385','HR'],['+383','XK'],['+382','ME'],['+381','RS'],['+380','UA'],
    ['+377','MC'],['+376','AD'],['+375','BY'],['+374','AM'],['+373','MD'],['+372','EE'],['+371','LV'],['+370','LT'],
    ['+359','BG'],['+358','FI'],['+357','CY'],['+356','MT'],['+355','AL'],['+354','IS'],['+353','IE'],['+352','LU'],['+351','PT'],
    ['+291','ER'],
    ['+269','KM'],['+268','SZ'],['+267','BW'],['+266','LS'],['+265','MW'],['+264','NA'],['+263','ZW'],['+261','MG'],
    ['+260','ZM'],['+258','MZ'],['+257','BI'],['+256','UG'],['+255','TZ'],['+254','KE'],['+253','DJ'],['+252','SO'],
    ['+251','ET'],['+250','RW'],['+249','SD'],['+248','SC'],['+245','GW'],['+244','AO'],['+243','CD'],['+242','CG'],
    ['+241','GA'],['+240','GQ'],['+238','CV'],['+237','CM'],['+236','CF'],['+235','TD'],['+234','NG'],['+233','GH'],
    ['+232','SL'],['+231','LR'],['+230','MU'],['+229','BJ'],['+228','TG'],['+227','NE'],['+226','BF'],['+225','CI'],
    ['+224','GN'],['+223','ML'],['+222','MR'],['+221','SN'],['+220','GM'],['+218','LY'],['+216','TN'],['+213','DZ'],
    ['+212','MA'],['+211','SS'],
    ['+98','IR'],['+95','MM'],['+94','LK'],['+93','AF'],['+92','PK'],['+91','IN'],['+90','TR'],
    ['+86','CN'],['+84','VN'],['+82','KR'],['+81','JP'],['+66','TH'],['+65','SG'],['+64','NZ'],['+63','PH'],
    ['+62','ID'],['+61','AU'],['+60','MY'],['+58','VE'],['+57','CO'],['+56','CL'],['+55','BR'],['+54','AR'],
    ['+53','CU'],['+52','MX'],['+51','PE'],['+49','DE'],['+48','PL'],['+47','NO'],['+46','SE'],['+45','DK'],
    ['+44','GB'],['+43','AT'],['+41','CH'],['+40','RO'],['+39','IT'],['+36','HU'],['+34','ES'],['+33','FR'],
    ['+32','BE'],['+31','NL'],['+30','GR'],['+27','ZA'],['+20','EG'],
    ['+7','RU'],['+1','US'],
  ];

  const splitPhone = (stored) => {
    if (!stored) return { iso: 'GB', local: '' };
    const s = stored.trim();
    for (const [prefix, iso] of PREFIX_TO_ISO) {
      if (s.startsWith(prefix)) return { iso, local: s.slice(prefix.length).trimStart() };
    }
    return { iso: 'GB', local: s };
  };

  const getFullPhone = () => {
    const iso = elements.phonePrefix ? elements.phonePrefix.value : 'GB';
    const country = COUNTRY_DATA[iso] || {};
    const local = elements.phoneInput ? elements.phoneInput.value.trim() : '';
    if (!local) return '';
    return country.prefix ? `${country.prefix} ${local}` : local;
  };

  let currentSnapshot = null;

  const formatDisplayName = (profile, user) => {
    const explicit = profile.name || '';
    if (explicit) return explicit;
    const email = profile.email || user.email || '';
    if (!email) return 'Account holder';
    const local = email.split('@')[0] || '';
    const cleaned = local.replace(/[._-]+/g, ' ').trim();
    return cleaned ? cleaned.replace(/\b\w/g, (char) => char.toUpperCase()) : email;
  };

  const setStatus = (node, message, state) => {
    if (!node) return;
    node.textContent = message || '';
    node.classList.remove('is-success', 'is-error', 'is-loading');
    if (state === 'success') node.classList.add('is-success');
    if (state === 'error') node.classList.add('is-error');
    if (state === 'loading') node.classList.add('is-loading');
  };

  // ── Per-field inline editing ─────────────────────────────
  const initField = (fieldEl) => {
    const input = fieldEl.querySelector('input');
    const editBtn = fieldEl.querySelector('.profile-field-edit');
    const saveBtn = fieldEl.querySelector('.profile-field-save');
    const cancelBtn = fieldEl.querySelector('.profile-field-cancel');
    const statusEl = fieldEl.querySelector('.profile-field-status');
    if (!input || !editBtn) return;

    const isPhone = fieldEl.dataset.profileField === 'phone';
    const flagEl = isPhone ? fieldEl.querySelector('.profile-phone-flag') : null;
    const prefixSel = isPhone ? fieldEl.querySelector('.profile-phone-prefix') : null;
    let originalValue = '';
    let originalPrefix = '';

    const enterEdit = () => {
      originalValue = input.value; // full phone e.g. "+44 7700 900000"
      if (isPhone && prefixSel) {
        const { iso, local } = splitPhone(originalValue);
        prefixSel.value = iso;
        originalPrefix = iso;
        input.value = local; // only the local part is editable
        if (flagEl) flagEl.hidden = true;
        prefixSel.hidden = false;
        prefixSel.disabled = false;
      }
      input.readOnly = false;
      input.classList.remove('is-readonly');
      fieldEl.classList.add('is-editing');
      editBtn.hidden = true;
      if (saveBtn) saveBtn.hidden = false;
      if (cancelBtn) cancelBtn.hidden = false;
      setStatus(statusEl, '');
      input.focus();
      input.select();
    };

    const exitEdit = (revert) => {
      if (isPhone && prefixSel) {
        if (revert) prefixSel.value = originalPrefix;
        const country = COUNTRY_DATA[prefixSel.value] || {};
        let full;
        if (revert) {
          full = originalValue;
        } else {
          full = input.value.trim() ? `${country.prefix} ${input.value.trim()}` : '';
        }
        input.value = full;
        if (flagEl) {
          flagEl.textContent = country.flag || '';
          flagEl.hidden = !full;
        }
        prefixSel.hidden = true;
        prefixSel.disabled = true;
      } else if (revert) {
        input.value = originalValue;
      }
      input.readOnly = true;
      input.classList.add('is-readonly');
      fieldEl.classList.remove('is-editing');
      editBtn.hidden = false;
      if (saveBtn) saveBtn.hidden = true;
      if (cancelBtn) cancelBtn.hidden = true;
      setStatus(statusEl, '');
    };

    const saveField = async () => {
      if (!currentSnapshot) return;
      const fieldName = fieldEl.dataset.profileField;
      const newValue = input.value.trim();
      input.value = newValue;

      // Always send both fields together
      let name;
      if (fieldName === 'name') {
        name = newValue;
      } else {
        name = elements.nameInput ? elements.nameInput.value.trim() : '';
      }
      let phone;
      if (fieldName === 'phone') {
        phone = getFullPhone();
      } else {
        phone = elements.phoneInput ? getFullPhone() : '';
      }

      if (!name) {
        setStatus(statusEl, 'Full name is required.', 'error');
        return;
      }

      try {
        if (saveBtn) { saveBtn.disabled = true; saveBtn.classList.add('is-loading'); }
        setStatus(statusEl, 'Saving\u2026', 'loading');
        await auth.saveProfile({ name, phone });
        if (fieldName === 'name' && elements.displayName) {
          const profile = (currentSnapshot.profile || {});
          elements.displayName.textContent = name || formatDisplayName(profile, currentSnapshot.user);
        }
        exitEdit(false);
        setStatus(statusEl, 'Saved.', 'success');
        currentSnapshot = auth.getSnapshot();
        setTimeout(() => setStatus(statusEl, ''), 2000);
      } catch (err) {
        setStatus(statusEl, err.message, 'error');
      } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.classList.remove('is-loading'); }
      }
    };

    editBtn.addEventListener('click', enterEdit);
    if (saveBtn) saveBtn.addEventListener('click', saveField);
    if (cancelBtn) cancelBtn.addEventListener('click', () => exitEdit(true));

    // Keyboard shortcuts while input is focused
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); saveField(); }
      if (e.key === 'Escape') exitEdit(true);
    });
  };

  // ── Auth state rendering ─────────────────────────────────
  const renderVerificationNote = (snapshot) => {
    if (!elements.note) return;
    if (snapshot.user.emailVerified) {
      // Show badge inside email card
      if (elements.verifiedBadge) elements.verifiedBadge.hidden = false;
      elements.note.innerHTML = '';
      return;
    }
    if (elements.verifiedBadge) elements.verifiedBadge.hidden = true;
    elements.note.innerHTML =
      '<span class="profile-note-line"><span class="fa-solid fa-circle-exclamation" aria-hidden="true"></span><span>Email not yet verified — check your inbox for the verification link.</span></span>' +
      '<span class="profile-note-meta"><span class="fa-solid fa-envelope-open-text" aria-hidden="true"></span><span>Can’t find it? Check spam or junk.</span></span>';
  };

  const renderEmailNote = () => {
    // note now lives inside the email card via verifiedBadge; nothing to render externally
  };

  const resetFormValues = (snapshot) => {
    const profile = snapshot.profile || {};
    if (elements.displayName) elements.displayName.textContent = formatDisplayName(profile, snapshot.user);
    if (elements.nameInput) elements.nameInput.value = profile.name || '';
    if (elements.emailInput) elements.emailInput.value = profile.email || snapshot.user.email || '';
    // Parse stored phone — display full number in read-only, set flag
    const { iso, local } = splitPhone(profile.phone || '');
    const country = COUNTRY_DATA[iso] || {};
    const fullPhone = local ? `${country.prefix} ${local}` : '';
    if (elements.phoneInput) elements.phoneInput.value = fullPhone;
    if (elements.phonePrefix) {
      elements.phonePrefix.value = iso;
      elements.phonePrefix.hidden = true;
      elements.phonePrefix.disabled = true;
    }
    if (elements.phoneFlag) {
      elements.phoneFlag.textContent = country.flag || '';
      elements.phoneFlag.hidden = !fullPhone;
    }
    renderVerificationNote(snapshot);
    renderEmailNote();
  };

  const setLockedState = (snapshot) => {
    if (elements.locked) elements.locked.hidden = false;
    if (elements.authenticated) elements.authenticated.hidden = true;
    if (!elements.lockedStatus) return;
    if (snapshot.loading) {
      setStatus(elements.lockedStatus, 'Checking your session.', 'loading');
      return;
    }
    if (!snapshot.configured) {
      setStatus(elements.lockedStatus, 'Authentication is not configured yet. Add your project values in scripts/auth-config.js.');
      return;
    }
    setStatus(elements.lockedStatus, 'Sign in to view and edit your profile.');
  };

  const setAuthenticatedState = (snapshot) => {
    if (elements.locked) elements.locked.hidden = true;
    if (elements.authenticated) elements.authenticated.hidden = false;
    currentSnapshot = snapshot;
    resetFormValues(snapshot);
  };

  const render = async () => {
    await auth.whenReady();
    const snapshot = auth.getSnapshot();
    if (!snapshot.user) {
      setLockedState(snapshot);
      return;
    }
    setAuthenticatedState(snapshot);
  };

  // Initialise per-field editing
  document.querySelectorAll('.profile-field[data-profile-field="name"], .profile-field[data-profile-field="phone"]')
    .forEach(initField);

  window.addEventListener('ayuta:auth-updated', render);
  render();
})();
