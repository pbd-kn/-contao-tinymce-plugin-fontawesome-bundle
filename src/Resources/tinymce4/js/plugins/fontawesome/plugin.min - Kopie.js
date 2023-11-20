debugger;
    // This is the json format of https://gist.github.com/anthonykozak/84e07a2cf8c27d3e5a8f181742ca293d
// https://use.fontawesome.com/releases/v6.0.0/js/all.js
// icon size   fa-2xs fa-xs fa-sm fa-lg fa-xl
// fa-1x fa-2x fa-3x fa-4x fa-5x fa-6x fa-7x fa-8x fa-9x fa-10x
// extra version 5 kann nur fa-spin und fa-pulse
// fa-beat fa-fade fa-beat-fade fa-bounce fa-flip fa-shake fa-spin fa-spin-reverse fa-spin-pulse (fa-spin-pulse fa-spin-reverse)
//var akttextcolor='black';           // bei Klick auf Farbbername
//const version = '5.12.0';             // darzustellende Version
var meta = [];                      // metadaten werdn dynamisch von fontawesom geholt
var translate = tinymce.util.I18n.translate;
const config = {
  textColor: 'black', 
  iconselected: false,
  iconLfnr: '0',
  iconType: 'fas',
  iconName: 'hourglass',  
  iconSize: 'fa-3x',
  iconSizeStyle: '3em',
  iconEffectClass: '',
}
const iconSizes =    ['fa-sm' ,'fa-lg','fa-2x','fa-3x','fa-5x','fa-7x','fa-10x'];
const iconSizesStyle=['.875em','1.33333em','2em'  ,'3em'  ,'5em'  ,'7em'  ,'10em'];

const selectedFilters = {      // globaler Speicher fuer selectierten Filter
  membership: "free",
  style: "",
  category: "",
  search: "",
};
var iconListGroups = [];
var iconCategories = [];

var CategorieOptions = [];                      // enthaelt das Optionfeld fuer die Listbox categorie
var iconList = [];                              // MetaData der Icons

/* fuellt die iconListGroups[categoryName] mit den zugehoerigen Icons
 */
function generateIconGroupList(memberShip) {
  console.log('PBD generateIconGroupList len '+iconList.length)
  if (memberShip != 'Free') return;         // Derzeit nur Free
  // Sort the icons alphabetically
  iconList.sort(function(a, b) {
    if (a.id < b.id) { return -1; }
    if (a.id > b.id) { return 1; }
    return 0;
  });
  //iconListGroups['brands'] = [];
  //iconCategories.push('brands');
  var categoryName;
  for (var i = 0; i < iconList.length; i++) {
    if (typeof iconList[i].familyStylesByLicense.Free != "undefined") {
      for (var ii = 0; ii < iconList[i].familyStylesByLicense.Free.length; ii++) {    // ueber alle categorien des Icons
        categoryName=iconList[i].familyStylesByLicense.Free[ii].family;
        categoryName = categoryName.replace(/ (.)/g, function(match, group1) { // ist vor der categorie ein blank so wird die categorie groá geschreiben
          console.log('PBD generateIconGroupList replace match '+match+' group1 '+group1);
               return group1.toUpperCase();
            }); 
			
        if (!iconListGroups[categoryName]) {
          iconListGroups[categoryName] = [];
        //console.log('PBD generateIconlist push to iconListGroups '+categoryName);
        }
        iconListGroups[categoryName].push(iconList[i]);    // icon zur categorie speichern
        //console.log('PBD generateIconlist push to categorie '+categoryName+' [] '+iconCategories[categoryName]);
        if (!iconCategories.includes(categoryName)) {
          iconCategories.push(categoryName);
          console.log('PBD generateIconGroupList push to categorie '+categoryName+' xx [] '+iconCategories[categoryName]);
        }
      }
    }
  }
  console.log('PBD generateIconGroupList iconCategories len '+iconCategories.length+' groups len '+iconListGroups.length);
}
/*
 * sortiert die Categorien alphabetisch
 * und liefert das categorie Array fuer den Dialog zurueck
 */
function createCategorieOptions() {
  console.log ('createCategorieOptions');
  const res =[];
  res.push ({text:'---',value:''});
  iconCategories.sort(function(a,b) {return a.replace(/[^a-z]/ig,'') > b.replace(/[^a-z]/ig,'') ? 1 : -1;});
  for(var i=0;i<iconCategories.length;i++) {
    res.push ({text:translate(iconCategories[i]),value:iconCategories[i]});
    //console.log ('showCategorieOption fill cat filter '+iconCategories[i]);
  }
  console.log('createCategorieOptions res len '+res.length);
  return res;
}


/*
 * liest die Metadaten zur Version und membership ein
 * membership Free oder Pro und legt sie via function setMetaData in var iconList ab.
    body: 'query { release(version:"'+vers+'") { icons { id label unicode  familyStylesByLicense {'+membership+' { family style } } }}}'
    body: 'query GetMeCategorizedIcons { release(version:"'+vers+'") { icons { id label unicode categories familyStylesByLicense {'+membership+' { family style } } }}}'
 */
function getMetadata(vers,membership) {
  console.log('Get Metadata Version '+vers);
  fetch('https://api.fontawesome.com', {
    method: 'post',
    body: 'query { release(version:"'+vers+'") { icons { id label unicode familyStylesByLicense {'+membership+' { family style } } }}}'
    //query { release(version:"'+vers+'") { icons { id label unicode familyStylesByLicense {'+membership+' { family style } }}}}  
  })
  .then(function(response) {
    if (!response.ok) {
      throw new Error('pbd Network response was not ok');
    }
    return response.json();
  })
  .then(data => setMetaData(data)) // Übergebe `data` an verarbeiteDaten
  .catch(function(error) {
    console.error('pbd Fetch error:', error);
  });
//return iconsArray;
}


function getMetaGetdata(url) {
  console.log('Get MetadataGet url '+url);
  fetch(url)
  .then((response) => {
      return response.json();
    }) 
  .then(data => setMetaGetData(data)) // Übergebe `data` an verarbeiteDaten
  .catch(function(error) {
    console.error('pbd Fetch MetadataGet error:', error);
  });
//return iconsArray;
}
  const isObject = (obj) => {
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
  }

  const objToArray = (obj) => {
    return Object.keys(obj).map((key) => {
      return [
        key, isObject(obj[key]) ? 
        objToArray(obj[key]) :
        obj[key]
      ];
    });    
  }

function setMetaGetData(data) {
  console.log('pbd Response setMetaGetData Data:');
    //iconList=JSON.parse(JSON.stringify(data));
  iconList=objToArray(data);
    console.log ('setMetaGetData iconList len '+iconList.length );
    generateIconGroupList('Free');
    console.log ('nach generateIconGroupList' );
    CategorieOptions = createCategorieOptions();
}
function setMetaData(data) {
  console.log('pbd Response Data:');
  if (typeof data.errors !== 'undefined') {
    // the variable is defined
    for (const element of data.errors) {
      console.log('Fehler query: ' + element.message);
    }
  } else {
    iconList=data.data.release.icons;
    console.log ('setMetaData len '+iconList.length );
    generateIconGroupList('Free');
    console.log ('nach generateIconGroupList' );
    CategorieOptions = createCategorieOptions();
  }
}

/*
 * zeigt die Auswahl der moeglichen Groessen an
 * config.iconType enth„lt fab / fas Aus data-iconType Attribute bei select s. function selectIcon
 * config.icinName die iconName
 * config.textcolor die ausgew„hlte Farbe
 */
function showSelectSize() {
  console.log('show Selected Size '+'" data-iconType="'+config.iconType+'" data-name="'+config.iconName+'"'+'" color="'+config.textColor+'"');
  col='black';       // defaultcolor
  if( typeof config.textColor === 'undefined' || config.textColor === null || config.textColor==''){
    col='black';    
  } else {
    col=config.textColor;    
  }
  
  let style ="";
  cl ='fas';
  if (config.iconType === 'fab') {
    style="font-family:\'Font Awesome 5 brands\'; font-weight: 400; font-size: 3em;";
    style="font-family:\'Font Awesome 5 brands\'; font-weight: 400; font-size: 1.4em;";
  } else {
    style="font-family:\'Font Awesome 5 Free\'; font-weight: 900; font-size: 3em;";
    style="font-family:\'Font Awesome 5 Free\'; font-weight: 900; font-size: 1.4em;";
  }
          style="Font Awesome Kit";
          style="";

  console.log('showSelectSize style '+style);
  gridHtml = '<div>';
  gridHtml += translate('select size')+'<br>';
  for (var i = 0; i < iconSizes.length; i++) { 
    sz=iconSizes[i];
    //szst=' style="'+style+' font-size: '+iconSizesStyle[i]+';"';
    //szst=' style="'+style+';"';
//console.log('szst '+szst);
    gridHtml += '<i class="mce_fasizing ';
    gridHtml += config.iconType+' fa-'+config.iconName+' '+config.iconEffectClass+' '+sz+' "';   // class ende
    gridHtml += ' data-icon-size="'+sz+'"';
//    gridHtml += ' data-icon-iconSizesStyle="'+iconSizesStyle[i]+'" ';
//    gridHtml += ' '+szst+'></i>';
    gridHtml += '></i>';
   } 
  gridHtml += '</div>';
  console.log('show Selected Size ende');
  return gridHtml;
}

/*
 * liefert das ausgewaehlte Icon mit denzugehoerigen optionen als String zurueck
 */
function getAweIcon(extraStyle='') { 
  style = '';
  if( typeof config.textColor === 'undefined' || config.textColor === null || config.textColor==''){
    style=' style="'+extraStyle+';"';
  } else {
    style=' style="'+extraStyle+'color: '+config.textColor+';"';    
  }
  //console.log('PBD  getAweIcon start '+config.iconType+' fa-'+config.iconName+' size '+config.iconSize+' style '+style);    
  ret = '<i class="'+config.iconType+' fa-'+config.iconName+' '+config.iconSize+' '+config.iconEffectClass+'"'+style+'>&zwj;</i>';
  console.log('PBD  getAweIcon ende ret '+ret);    
  return ret;
}

/*
 * zeigt die die Vorschau an
 * config.iconType enth„lt fab / fas Aus data-iconType Attribute bei select s. function selectIcon
 * config.icinName die iconName
 * config.textcolor die ausgew„hlte Farbe
 */
function showVorschau() {
console.log('PBD showVorschau');
  let style ='color: '+config.textColor;
  cl ='fas';

  gridHtml = '<div>';


  gridHtml += '<i class="mce_fasizing '+config.iconType+' fa-'+config.iconName+' '+config.iconSize+' '+config.iconEffectClass+' " data-icon-size="'+config.iconSize+'" style="'+style+'"></i>';
  gridHtml += '</div>';
  //console.log('showVorschau grid '+gridHtml);
  return gridHtml
}

tinymce.PluginManager.add('fontawesome', function(editor, url) {
  //var font_awesome_path = editor.getParam('font_awesome_path');
  var font_awesome_metafile_version = editor.getParam('font_awesome_metafile_version');
  var font_awesome_metafile_data = editor.getParam('font_awesome_metafile_data');
  var ic = JSON.parse(font_awesome_metafile_data);
  //console.log('font_awesome_path for fontawesome5.1:'+font_awesome_path);
  console.log('font_awesome_metafile_version for font_awesome_metafile_version: '+font_awesome_metafile_version);
  var redial=false;                   // Kennzeichnng ob bei Tabwechsel ein redial durchgefhrt werden soll
  var mce_dialogApi;              // zwischenspeicher fr dialogapi
  var currentTab='tabIcons';                 // enthaelt den Namen des ktuellen Tabs (fuer Redial) notwendig 
  //var jsonPath = url+"/json/";
  var iconList="";
//  meta = getMetadata(font_awesome_metafile_version,'Free');
getMetaGetdata('/assets/font-awesome/metadata/icons.json');
  CategorieOptions.push ({text:'---',value:''});  // muss wohl sein, sonst funktioniert der erste Aufruf nicht
  var FullIconHtml="";                            // enthaelt den html-String fuer alle Icons




/* bearbeitet den geladen Html-code
 * wertet die Filter aus und setzt ber das style-Attribute das Icon sichtbar oder nicht
 */
function filterIconHtml () {
  var els = document.querySelectorAll(".mce-icon-cell");
console.log ('filterIconHtml len mce-icon-cell els '+els.length);
  if (selectedFilters.category==='' && selectedFilters.style===''&& selectedFilters.search==='') {  // keine Filter alles anzeigen
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      e.style.display = "inline-flex";
    }
    return;
  }
  if (selectedFilters.category!=='' && selectedFilters.style===''&& selectedFilters.search==='') {  // nur categorie Filter
    console.log ('filterIconHtml select only category '+selectedFilters.category);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.getAttribute("data-category")==selectedFilters.category) {
        e.style.display = "inline-flex";
      } else {
        e.style.display = "none";
      }
    }
    return;
  }
  if (selectedFilters.category=='' && selectedFilters.style!==''&& selectedFilters.search==='') {  // nur styles Filter
    console.log ('filterIconHtml select only style '+selectedFilters.style);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.getAttribute("data-iconStyle")==selectedFilters.style) {
        nm=e.getAttribute("data-name");
        console.log ('filterIconHtml selected '+nm);
        e.style.display = "inline-flex";
      } else {
        e.style.display = "none";
      }
    }
    return;
  }
  if (selectedFilters.category==='' && selectedFilters.style===''&& selectedFilters.search!=='') {  // nur suche
    console.log ('filterIconHtml select only search '+selectedFilters.search);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      nm=e.getAttribute("data-name");
      if (nm.includes(selectedFilters.search)){
        nm=e.getAttribute("data-name");
        console.log ('filterIconHtml selected '+nm);
        e.style.display = "inline-flex";
      } else {
        e.style.display = "none";
      }
    }
    return;
  }
  if (selectedFilters.category!=='' && selectedFilters.style!==''&& selectedFilters.search==='') {  // category und style
    console.log ('filterIconHtml select category und style '+selectedFilters.category+' '+selectedFilters.style);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.getAttribute("data-category")==selectedFilters.category && e.getAttribute("data-iconStyle")==selectedFilters.style) {
        e.style.display = "inline-flex";
      } else {
        e.style.display = "none";
      }
    }
    return;
  }
  if (selectedFilters.category!=='' && selectedFilters.style===''&& selectedFilters.search!=='') {  // Category search
    console.log ('filterIconHtml select category search '+selectedFilters.category+' '+selectedFilters.search);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      nm=e.getAttribute("data-name");
      if (e.getAttribute("data-category")==selectedFilters.category&&nm.includes(selectedFilters.search)) {
        e.style.display = "inline-flex";
      } else {
        e.style.display = "none";
      }
    }
    return;
  }
  if (selectedFilters.category==='' && selectedFilters.style!==''&& selectedFilters.search!=='') {  // style search
    console.log ('filterIconHtml select style search '+selectedFilters.style+' '+selectedFilters.search);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      nm=e.getAttribute("data-name");
      if (e.getAttribute("data-iconStyle")==selectedFilters.style&&nm.includes(selectedFilters.search)) {
        e.style.display = "inline-flex";
      } else {
        e.style.display = "none";
      }
    }
    return;
  }
  if (selectedFilters.category!=='' && selectedFilters.style!==''&& selectedFilters.search!=='') {  // category style search
    console.log ('filterIconHtml select category style search '+selectedFilters.category+' '+selectedFilters.style+' '+selectedFilters.search);
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      nm=e.getAttribute("data-name");
      if (e.getAttribute("data-category")==selectedFilters.category && e.getAttribute("data-iconStyle")==selectedFilters.style&&nm.includes(selectedFilters.search)) {
        e.style.display = "inline-flex";
      } else {
        e.style.display = "none";
      }
    }
    return;
  }
}

// erzeugt dann Html-code der alle Icons enthaelt. geordnet nach categorien
function createFullIconHtml() {
  console.log('createFullIconHtml')
  var lfnr=-1;   // laufende Nummer zu identifikation der Icons ueber alle categorien
  
  /*
   * gibt die Icons zu einer Categorie aus
   */
  function groupHtml(categoriy, iconTitle) {
console.log('PBD groupHtml categoriy '+categoriy+' title '+iconTitle);
    var iconGroup = iconListGroups[categoriy];
    var x=-1;      // Zaehler icon pro Zeile
    if( typeof iconGroup === 'undefined') {
console.log('PBD groupHtml iconGroup undefined');
      return '<div> Categoriy '+categoriy+' nicht vorhanden</div>'
    }
    var gridHtml="";
    var id;
    //gridHtml += '<div class="mce-fontawesome-panel-category">Categorie: '+categoriy+' Titel '+iconTitle+'</div>';
    gridHtml += '<div class="mce-fontawesome-panel-content">';
    console.log('groupHtml iconGroup.length '+iconGroup.length+' categoriy '+categoriy); 
    for (var y = 0; y < iconGroup.length; y++) {
      lfnr++;
      x++;
      console.log('groupHtml iconGroup width '+width+' y '+y); 
      if (iconGroup[lfnr]) {   // Einzelnes Icon der Ausgabe
          //id = iconGroup[y * width + x].lfnr;
	      //id = id.replace('i:', '');    //    objectId aus json i.a i:xxx  i: entfernen wird als title verwendet
          id=iconGroup[lfnr].id;
          name = iconGroup[lfnr].label;
          let iconStyle = '';
          if (typeof iconGroup[lfnr].familyStylesByLicense.Free[0].style === 'undefined') {
          } else {
            iconStyle = iconGroup[lfnr].familyStylesByLicense.Free[0].style;
          } 
          let cl ='fas';
          let style="";
          if (iconStyle === 'brands') {
            cl='fab';
          } else {
            cl='fas';
          }
          style="height:2em;padding-top:1em";
          style="";
          //console.log('groupHtml name '+name+' st '+st+' style '+style+ ' lfnr '+lfnr);							
          console.log('groupHtml name '+name+' lfnr '+lfnr);							
          gridHtml += '<div id="mceicon_'+lfnr+'" class="mce-icon-cell js-mce-fontawesome-insert" title="'+id+'" data-name="'+id+'" data-iconType="'+cl+'" data-id="'+lfnr+'" data-category="'+categoriy+'" data-iconStyle="'+iconStyle+'" >';
          gridHtml += '<i class="faclass '+cl+' fa-'+id+'" style="'+style+'"></i>';
          gridHtml += '</div>';
        }
      //}   // ende Schleife ber width
    }  // end Schleife categorie.length
    gridHtml += '<div style="clear:both"></div>';  // bendet den float:left und startet eine neue Zeile
    gridHtml += '</div>';  // mce-fontawesome-panel-content pro categorie
    return gridHtml;
  }  // ende function groupHtml
  var width = 23;   // Anzahl Icons pro Zeile
  console.log ('pbd selectedFilters.category '+selectedFilters.category+' iconCategories.length '+iconCategories.length);
  let panelHtml="";
  //console.log ('pbd panelHtml '+panelHtml);
  for (var i = 0; i < iconCategories.length; i++) {
    panelHtml += groupHtml(iconCategories[i], translate(iconCategories[i]))
  }
  return panelHtml;                      
}

function selectIcon(lfnr) {
  console.log('selectIcon icon '+lfnr)
  var els = document.querySelectorAll(".mce-icon-cell");
  if (els.length !=0 ) {
    console.log('selectIcon icon lfnr '+lfnr+' len seliccon '+els.length)
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      e.classList.remove("selectedIcon");     // l”sche class selectedIcon
    }
    document.getElementById('mceicon_'+lfnr).classList.add("selectedIcon");                 // setze Object als selected
    config.iconType=document.getElementById('mceicon_'+lfnr).getAttribute("data-iconType");   // fas, fab ..
    config.iconName=document.getElementById('mceicon_'+lfnr).getAttribute("data-name");  // name ohne fa-
    config.iconLfnr=document.getElementById('mceicon_'+lfnr).getAttribute("data-id");          // laufende nummer
    config.iconselected = true;
    console.log('selectIcon setting class '+config.iconType+' name '+config.iconName+' lfnr '+config.iconLfnr)
    //mce_dialogApi.setEnabled('submitButton', true);
    mce_dialogApi.redial(getdialogConfig());
    mce_dialogApi.showTab("tabColor");
  }
}

/*
 * speichert die groesse des selectierten icons und setzt den border dazu
 */
function selectIconSize(size) {
  config.iconSize = size;
  var els = document.querySelectorAll(".mce_fasizing");
  // search the fontsize for mce
  for (var i=0;i<iconSizes.length;i++) {
    if (config.iconSize == iconSizes[i]) {
      config.iconSizeStyle = iconSizesStyle[i];                    // merke die Groesse fr die mce Darstellung in Vorschau
      break;
    } 
  }
  console.log('selectIconSize size '+config.iconSize+ ' els len '+els.length);
  
  for (var i = 0; i < els.length; i++) {   // alle Border loeschen
    var e = els[i];
    e.style.border = "2px solid #ffffff";
    //e.style.border = "2px solid purple";
  }
  console.log ('selector '+".mce_fasizing." + size);
  els = document.querySelectorAll(".mce_fasizing." + size);
  console.log('selectIconSize size '+config.iconSize+ ' els1 len '+els.length);
  for (var i = 0; i < els.length; i++) {
    var e = els[i];
    e.style.border = "2px solid #207ab7";     // border setzen
  }
}


function getdialogConfig(){
  return {
    title: 'Fontawesome Icons',
    size: 'large',
    body: {
      type: 'tabpanel',
      tabs: [
        { name: 'tabIcons', title: 'Icons '+font_awesome_metafile_version,                                   
          items: [ 
            {  type: "bar",items: [
                 { type: 'selectbox', name: 'freeSelect',label: 'Lizenz',disabled: false, size: 1, 
                     items: [
                        { value: 'free', text: 'Free' },
                        //{ value: 'pro', text: 'Pro' }    bei Pro weiss ich nicht was tun
                     ]
                 },  
                 {  type: 'listbox', name: 'selectStyle',label: 'Style',disabled: false, 
                      items: [
                        { text: '---', value: '' },
                        { text: 'Regular', value: 'regular' },
                        { text: 'Solid', value: 'solid' },
                        { text: 'Brand', value: 'brands' },
                     ],
                 },                
                 { type: 'listbox', name: 'selectCategorie', label: 'Family',disabled: false, items: CategorieOptions, }, 
                 { type: 'input', name: 'searchIcon',inputMode: 'text',label: 'Search', disabled: false,maximized: false},                
               ],      // ende bar items
            },
            { type: 'htmlpanel', html: FullIconHtml },
          ]
        },           // ende tabIcons
        { name: 'tabColor', title: 'Icon Konfiguration',
          items: [        // Elemente des Tab Formulars
                 { type: 'listbox',name: 'selectEffectTab',label: 'Effect',disabled: false,
                   items: [
                     { text: '---', value: '' },
                     { text: 'Spin', value: 'fa-spin' },
                     { text: 'Spin Reverse', value: 'fa-spin fa-spin-reverse' },
                     { text: 'Pulse', value: 'fa-pulse' },
                     { text: 'Beat', value: 'fa-beat' },
                     { text: 'Beat Fade', value: 'fa-beat-fade' },
                     { text: 'Bounce', value: 'fa-bounce' },
                     { text: 'Fade', value: 'fa-fade' },
                     { text: 'Flip', value: 'fa-flip' },
                     { text: 'Shake', value: 'fa-shake' },
                    
                   ],
                 },
            { type: 'htmlpanel', html: showSelectSize() },
            { type: 'label', label: translate('select color'), items: [{ type: "colorpicker", name: "mce_colorpicker" }] },
              // extra version 5 kann nur fa-spin und fa-pulse
              // fa-beat fa-fade fa-beat-fade fa-bounce fa-flip fa-shake fa-spin fa-spin-reverse fa-spin-pulse (fa-spin-pulse fa-spin-reverse)
          ],         // ende tabColor Items
        },           // ende tabColor 
        { name: 'tabVorschau', title: 'Vorschau',
          items: [        // Elemente des Formulars
            { type: 'htmlpanel', html: '<div style="color:'+'inherit'+'">Vorschau</div>'},          
            { type: 'htmlpanel', html: showVorschau() }, 
          ]         
        },           // ende tabVorschau
      ] // ende tabs
    },
    buttons: [  // footer Buttons
      { type: 'submit', name: 'submitButton', buttonType: 'primary', text: translate('ok'), },
      { type: 'cancel', name: 'closeButton', text: translate('cancel'), },
    ],
    initialData: { },
    onSubmit: (api) => {
      res=getAweIcon();
      console.log ('submit '+res);
      if (!tinymce.activeEditor.execCommand('mceInsertContent', false,res)){
        console.log('!!! Fehler bei submit');
      }
      api.close();
    },
    onAction: (dialogApi, details) => {     // wird gerufen u.a bei button click
      // log the contents of details
      const data = dialogApi.getData();
      const v=data.mce_colorpicker; // get hexWert from colorpicker 
    },
    onChange: function (dialogApi, details) {
      var data = dialogApi.getData();
      var nm = details.name;
      console.log ('pbd onchange nm '+nm);
      switch (nm) {
        case 'selectCategorie':
          var val = data.selectCategorie;
          console.log ('selectCategorie nm '+nm+'  wert '+val+' old '+selectedFilters.category);
          selectedFilters.category = val; 
          filterIconHtml();
        break;
        
        case 'selectStyle':
          var val = data.selectStyle;
          console.log ('selectStyle nm '+nm+'  wert '+val+' old '+selectedFilters.style);
          selectedFilters.style = val; 
          filterIconHtml();
        break;
        case 'searchIcon':
          var val = data.searchIcon;
          console.log ('selectCategorie nm '+nm+'  wert '+val);
          selectedFilters.search = val; 
          filterIconHtml();
        break;
        case 'selectEffect':        
          var val = data.selectEffect;
          console.log ('selectEffect nm '+nm+'  wert '+val+' old '+config.iconEffectClass);
          config.iconEffectClass = val; 
          break;
        case 'selectEffectTab':        
          var val = data.selectEffectTab;
          console.log ('selectEffectTab nm '+nm+'  wert '+val+' old '+config.iconEffectClass);
          config.iconEffectClass = val;
          mce_dialogApi.redial(getdialogConfig());
          mce_dialogApi.showTab("tabColor");
          break;
          
        default:
          console.log ('onChange was '+nm);
        break;
        
      }
    },
  
    onTabChange: (dialogApi, details) => {
      const data = mce_dialogApi.getData();
      console.log('onTabChange newname '+details.newTabName+' oldname '+details.oldTabName+' redial '+redial+' color '+config.textColor);
      console.log('PBD onTabChange setting group '+config.iconType+' name '+config.iconName);

      if (details.newTabName == "tabColor") {
        console.log('PBD onTabChange tabcolor color'+config.textColor);
        //console.log('nach setdata');
        var els = document.querySelectorAll(".mce_fasizing");        // gib alle Elemente  mit der Gr”ssenangabe
        console.log('tabColor len fasing '+els.length+' color '+config.textColor);
        for (var i = 0; i < els.length; i++) {                       // setze Farbe
          var e = els[i];
          e.style.color = config.textColor;
        }
        redial=true;
      } else if (details.newTabName == "tabVorschau") {
        if (redial == true) {
          redial=false;
          mce_dialogApi.redial(getdialogConfig());
          mce_dialogApi.showTab("tabVorschau");
        }
      }
    },
  };
}
function initListener() {
  // Insert icon listener 
  console.log('initListener');
  document.addEventListener("click", function (e) {
    console.log("click function");
    if (e.target.parentElement.classList.contains("js-mce-fontawesome-insert")) {   //check auf icon select Auswahl
      console.log("click function1 icon selected");
      selectIcon(e.target.parentElement.getAttribute("data-id"));                //??? mste das icht die id, d.h laufende nummer sein
    } else if (e.target.parentElement.parentElement.classList.contains("js-mce-fontawesome-insert")) {
      console.log("click function2 icon selected");
      selectIcon(e.target.parentElement.parentElement.getAttribute("data-id"));
    }
    if (e.target.classList.contains("mce_fasizing")) {
      console.log("click function3 size selected");
      selectIconSize(e.target.getAttribute("data-icon-size"));           // check auf Groessenauswahl
    } else if (e.target.parentElement.classList.contains("mce_fasizing")) {
      console.log("click function4 size selected");
      selectIconSize(e.target.parentElement.getAttribute("data-icon-size"));           // check auf Groessenauswahl
    }
    if (e.target.classList.contains("tox-sv-palette") || e.target.classList.contains("tox-hue-slider")) {
      console.log("click function4");
      var dataX = mce_dialogApi.getData();
      //akttextcolor=dataX.mce_colorpicker;
      config.textColor=dataX.mce_colorpicker;        
      mce_dialogApi.setData({ mce_colorpicker: config.textColor });
      var els = document.querySelectorAll(".mce_fasizing");      // Elemente Gr”áe
      console.log("click function3 len "+els.length+' color '+config.textColor);
      for (var i = 0; i < els.length; i++) {         // gr”áenicon einf„rben
        var e = els[i];
        e.style.color = config.textColor;
      }
    }
  });

  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("fai_pickerColorInput")) {
      var dataX = mce_dialogApi.getData();
      var els = document.querySelectorAll("mce_fasizing");
      for (var i = 0; i < els.length; i++) {
        var e = els[i];
        e.style.color = dataX.mce_colorpicker;
      }
    }
  });  
}

function initMe(editor) {
  console.log ('initMe ');

// initilisierungsRoutinen bevor der Manager aufgerufen wird
// json von Url lesen uebergibt den geparsten Text an callback

  console.log ('initMe vor windowManager open');

  mce_dialogApi = editor.windowManager.open(getdialogConfig());
  console.log('initMe nach windowmanager open');
  mce_dialogApi.block("Loading...");
console.log('initMe nach windowmanager block');

  FullIconHtml=createFullIconHtml();          // html aller icons icons erzeugen
  console.log ('initMe len FullIconHtml '+FullIconHtml.length);
  mce_dialogApi.redial(getdialogConfig());
  mce_dialogApi.unblock();
  
  console.log('initMe vor Listener');
  initListener();
}
    // Include plugin CSS
    editor.on('init', function() {
        var csslink = editor.dom.create('link', {
            rel: 'stylesheet',
            href: url + '/css/mce-panel.css'
        });
        document.getElementsByTagName('head')[0].appendChild(csslink);
       
console.log("pbd editor.on linkcss "+url + '/css/mce-panel.css ');
    });

  /* Add a button that opens a window */
  editor.ui.registry.addIcon('fontaweIcon', '<svg fill="none" height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 860"><path d="M763.634 0H96.366C43.576 0 0 43.576 0 96.366v667.268C0 816.424 43.576 860 96.366 860h667.268c52.79 0 96.366-43.576 96.366-96.366V96.366C860 43.576 816.424 0 763.634 0zm-87.152 545.754c0 8.063-6.911 11.518-14.973 14.974-32.058 13.821-66.42 26.299-103.277 26.299-51.638 0-75.634-32.058-137.638-32.058-44.728 0-91.759 16.125-129.576 33.21-2.304 1.151-4.607 1.151-6.911 2.303v87.152c0 3.455 0 6.911-1.152 9.214v2.304c-4.607 16.125-19.58 27.451-36.665 27.451-21.692 0-38.969-17.277-38.969-38.969V258c-14.973-11.518-25.147-29.754-25.147-50.487 0-35.513 28.603-64.308 64.308-64.308 35.514 0 64.308 28.603 64.308 64.308 0 20.733-9.214 38.969-25.147 50.487v35.513c3.455-1.151 6.911-2.303 10.366-4.607 35.513-14.973 77.937-27.451 118.058-27.451 43.576 0 77.937 11.518 116.906 26.299 8.063 3.456 16.125 4.608 25.148 4.608 43.575 0 91.759-30.907 103.276-30.907 9.215 0 17.277 6.911 17.277 14.974v269.325z" fill="#339af0"/></svg>');   // PBD
  editor.ui.registry.addButton('fontawesome', {
        //icon: 'flag',
        icon: 'fontaweIcon',
        //text: translate('Fontawesome'),
        tooltip: translate('Fontawesome'),
        onAction: function () { initMe(editor);} 
  });


    editor.ui.registry.addMenuItem('fontawesome', {
        icon: 'fontaweIcon',
        text: translate('Fontawesome'),
        tooltip: translate('Fontawesome'),
        onclick: function () { initMe(editor);}, 
        onAction: 'insert'
    });

});  // ende tinymce.PluginManager.add
tinymce.PluginManager.requireLangPack('fontawesome');


