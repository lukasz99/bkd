BKDlink  = {

 url: { "DIP":{"has-links":{
                "url":"https://dip.doe-mbi.ucla.edu/dip/Browse.cgi?D=1&ID=%%AC%%",
                "type":"interactions" }},
        "MIM":{"has-phenotype":{
                "url":"https://www.omim.org/entry/%%AC%%",
                "type":"gene/phenotype"}},
        "IntAct":{"has-links":{
                "url":"https://www.ebi.ac.uk/intact/interactors/id:%%AC%%*",
                "type":"interactions"}},
        "EMBL":{"encoded-by":{
                "url":"https://www.ncbi.nlm.nih.gov/nuccore/%%AC%%",
                "type":"gene/mRNA"}},
        "RefSeq":{"has-instance":{
                "url":"https://www.ncbi.nlm.nih.gov/protein/%%AC%%",
                "type":"protein"}},
        "PDB":{"has-structure":{
                 "url":"https://www.rcsb.org/structure/%%AC%%",
                 "type":"structure"}},
        "pubmed":{"described-by":{
                 "url":"https://pubmed.ncbi.nlm.nih.gov/%%AC%%",
                 "type":"source"}
                 },
        "pmid":{"described-by":{
                 "url":"https://pubmed.ncbi.nlm.nih.gov/%%AC%%",
                 "type":"source"}
                 },
        "PubMed":{"described-by":{
                 "url":"https://pubmed.ncbi.nlm.nih.gov/%%AC%%",
                 "type":"source"}
                 },
        "dbSNP":{"mutation":{
                 "url":"https://www.ncbi.nlm.nih.gov/snp/%%AC%%",
                 "type":"sequence variant"}},
        "dbsnp":{"mutation":{
                 "url":"https://www.ncbi.nlm.nih.gov/snp/%%AC%%",
                 "type":"sequence variant"},
                 "sequence-variant":{
                 "url":"https://www.ncbi.nlm.nih.gov/snp/%%AC%%",
                 "type":"sequence variant",
                 "label":"Variant(natural)"}},
        "clinvar":{"mutation":{
                 "url":"https://www.ncbi.nlm.nih.gov/clinvar/variation/%%AC%%",
                 "type":"mutation"},
                 "sequence-variant":{
                 "url":"https://www.ncbi.nlm.nih.gov/clinvar/variation/%%AC%%",
                 "type":"sequence variant",
                 "label":"Variant(natural)"}}
      },

 taxid: function( taxon ){
    var sname = taxon.sciName;
    var cname = taxon.comName;
    var taxid = taxon.taxid;

    var url = "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=";

    var el = sname;
    if(cname !== null && cname.length >0){
        el = el +"(" + cname + ")";
    }
    if(taxid !== null){
        el = el + "[txid:<a href='"+url+taxid+"'>"+taxid+"</a>]";
    }

    return el; 
 },

 xrefType: function( xref ){
   var ns = xref.ns;  
   var ac = xref.ac;
   var tp = xref.cvType.name;

   var el = null;
   console.log("links: XREF: " + JSON.stringify(xref));
   // format:
   //ns:<a>ac</ac> (type)
   console.log("links: x.ns:" + ns + " x.ns.tp:"+ tp);
   if( this.url[ns] ){
     if( this.url[ns][tp] ){
      
        url = this.url[ns][tp].url.replace("%%AC%%",ac);        

        el = ns + ":<a href='" + url + "'>" + ac + "</a>";
        if( this.url[ns][tp].type ){
          el = el + " (" + this.url[ns][tp].type + ")";          
        }
     }
   }
   if(el == null ){
     el = ns+":"+ac;
   }
   return el;
 },

 xref: function( xref ){
   var ns = xref.ns;  
   var ac = xref.ac;
   var tp = xref.cvType.name;

   var el = null;
   console.log("links: XREF: " + JSON.stringify(xref));
   // format:
   //ns:<a>ac</ac> (type)
   console.log("links: x.ns:" + ns + " x.ns.tp:"+ tp);

   if( this.url[ns] ){
     if( this.url[ns][tp] ){      
       url = this.url[ns][tp].url.replace("%%AC%%",ac);        
       el = ns + ":<a href='" + url + "'>" + ac + "</a>";
     }
   }

   if(el == null ){
     el = ns+":"+ac;
   }
   return el;
 }
};
                

