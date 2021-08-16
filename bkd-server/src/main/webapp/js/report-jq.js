BKDrep = {
      srcAnchor: null,
      tgtAnchor: null,
      valAnchor: null,

      fxList: null,
      frList: null,
      
      view: function(data, srcAnchor, tgtAnchor, valAnchor, mode){
         

         this.srcAnchor=srcAnchor;
         this.tgtAnchor=tgtAnchor;
         this.valAnchor=valAnchor;
         
         if(data == null ){
            BKDrep.search( data, this.srcAnchor );
            $( tgtAnchor ).hide();
            BKDrep.valEdit(data, this.valAnchor);
         } else{            
            BKDrep.tgtView( data, this.tgtAnchor, mode );
            if( mode == 'edit'){
              BKDrep.valEdit( data, this.valAnchor );
            } else {
              BKDrep.valView( data, this.valAnchor );
            }
         }
      },

      search: function( data, tgtAnchor ){
        
        $(tgtAnchor + " form").submit( function (event) {

           var radioValue = $("input[name='smode']:checked").val();
           if(radioValue){
              //alert("Your are a - " + radioValue);
           } else {
              radioValue = 'protein';
           } 
           var formData = {
             query: $("#bkdQuery").val(),
             qmode: radioValue,
             ret: "data"};


          
           $.ajax({
             type: "POST",
             url: "report",
             data: formData,
             dataType: "json",
             encode: true,}).done(function (data) {
                
               BKDrep.tgtView( data.record, BKDrep.tgtAnchor, "edit" );
               BKDrep.valEdit( data.record, BKDrep.valAnchor );
          });

        event.preventDefault();
       });

      },
      
      tgtView: function(data, tgtAnchor, mode ){
        
        if( data == null ){
          $( tgtAnchor ).hide();
        } else {
          $( tgtAnchor ).show();
        }
        
        var flist = BKDconf["report"]["feature"]["protein"]["subject"];

        // go over configuration

        for( var i = 0; i < flist.length; i++){
          var fname = flist[i].name;
          console.log("XX:" + fname);
          if( flist[i].list ){   // config field is list            
            
            if( flist[i].vpath ){    // list of values @ vpath
              var vpath = flist[i].vpath;           
              var fvlist = null; 
              if(vpath.length >0){
                fvlist = data['report'][vpath[0]];
                for(var j=1; j<vpath.length; j++){
                  if( fvlist[vpath[j]] ){
                    fvlist = fvlist[vpath[j]];
                  } else {
                    fvlist = null;
                    break;
                  }                  
                }
              }

              if( fvlist != null && fvlist.length > 0){

                // header for value list

                $(tgtAnchor).append("<div class='bkd-rep-fld'>\n"+
                                    " <div class='bkd-rep-fld'>"+fname+"</div>\n"+
                                    "</div>");
                
                for(var v = 0; v <fvlist.length; v ++){

                  // one line for each list value

                  var cval = fvlist[v];
                   
                  if(flist[i].type == "xref"){
                  
                     var cel = BKDlink.xref(cval);  
                     $( tgtAnchor + " >div:last")
                       .append(" <div class='bkd-rep-fld'> "+cel+"</div>\n");

                  } else {
                     $( tgtAnchor + " >div:last")
                       .append(" <div class='bkd-rep-fld'> "+cval.ns +": "+cval.ac+"</div>\n");
                  }                 
                }
              }
            }

            if(flist[i].value ){  // list of complex values (ie feature)
                var fname = flist[i].name;

                // list header
                
                $(tgtAnchor).append("<div class='bkd-rep-fld'>\n"+
                                    " <div class='bkd-rep-fld'>" + fname + "</div>\n"+
                                    "</div>");

                for(var k =0; k < flist[i].value.length; k ++){

                   // go over complex fields

                   var cname = flist[i].value[k].name;
                   var cvpath = flist[i].value[k].vpath;
                   var cvedit = flist[i].value[k].edit;
                   var cvid = flist[i].value[k].id;
                                     
                   var cval = null;   
                    
                   if(cvpath.length >0){
                     cval = data['report'][cvpath[0]];
                     for(var l=1; l<cvpath.length; l++){
                       if( cval[cvpath[l]] ){
                         cval = cval[cvpath[l]];
                       } else {
                         cval = null;
                          break;
                       }                        
                     }
                   }
                                      
                   if( cval !== null || (flist[i].value[k].edit && mode == 'edit') ){

                     if( flist[i].value[k].list ){  // list header
                       $( tgtAnchor + " >div:last")   
                          .append(" <div class='bkd-rep-fld' id='"+flist[i].value[k].id+"'>\n" +
                                  "   <div class='bkd-rep-fld'>" + cname + "</div>\n" +
                                  " </div>\n");
                     }
                     
                     if( flist[i].value[k].edit && mode == 'edit' ){ 

                        //build add fields for editable lists

                        if( flist[i].value[k].type == "xref") {
                              
                           // build xref-ns menu
                           var xnsel = "<select id='"+flist[i].value[k].id+"_ns'>";
                           for(var n = 0; n< flist[i].value[k]["xref-ns"].length; n++){
                              xnsel = xnsel + "<option value='"+flist[i].value[k]["xref-ns"][n]+"'>"+flist[i].value[k]["xref-ns"][n]+"</option>";
                           }
                           xnsel = xnsel + "</select>";
                              
                           // build xref-type menu                            
                           var xtsel ="<select id='" + flist[i].value[k].id+"_type'>";
                           for(var n = 0; n< flist[i].value[k]["xref-type"].length; n++){
                              xtsel = xtsel +"<option value='"+flist[i].value[k]["xref-type"][n].value+"'>"+flist[i].value[k]["xref-type"][n].name+"</option>";
                           }
                           xtsel = xtsel + "</select>";

                           var divAdd = " <div class='bkd-rep-fld'>" + 
                                        xnsel + 
                                        "  <input type='text' id='" + flist[i].value[k].id+"_ac'/> " + 
                                        xtsel + 
                                        "  <input type='button' id='" + flist[i].value[k].id+"_add'/>"+
                                        " </div>";

                           $( "#" + flist[i].value[k].id ).append( divAdd );
                           $( "#" + flist[i].value[k].id + "_add" ).attr('value', 'Add Xref');
                           $( "#" + flist[i].value[k].id + "_add" ).on( 'click', function (event) {

                              var prefix= event.currentTarget.id.replace('_add','_');

                              var xns = $("#"+event.currentTarget.id.replace('_add','_ns')).val();
                              var xac = $("#"+event.currentTarget.id.replace('_add','_ac')).val();
                              var xtp = $("#"+event.currentTarget.id.replace('_add','_type')).val();
                                                                                                   
                              BKDrep.fxlist = []

                              $(".bkd-xref").each( function( index, elem){
                                   BKDrep.fxlist.push( elem.id );                                 
                              });
                              
                              var xmax = 0;
                              
                              for(var x=0; x < BKDrep.fxlist.length; x++ ){                              
                                 var icur = Number( BKDrep.fxlist[x].replace( prefix, '' ) ); 
                                 if(  icur > xmax ){
                                   xmax = icur;
                                 }
                              }

                              xmax=xmax+1;
                              
                              var cval = BKDlink.xref({ns:xns, ac: xac, cvType:{ ac: xtp, name:"foo"}});
                              var cid = prefix + xmax;

                             $( "#" + event.currentTarget.id.replace('_add','') )
                                  .append(" <div class='bkd-rep-fld bkd-xref' id='"+cid+"'>" + cval +" <input type='button' id='"+cid+"_drop'/></div>\n");
                              $("#"+cid+"_drop").attr('value', 'Drop Xref');
                              $("#"+cid+"_drop").on( 'click', function (event) {                                 
                                  var idDrop = event.currentTarget.id.replace("_drop","");
                                  $("#" + idDrop ).remove();
                                }); 

                           });

                        } 

                        if( flist[i].value[k].type == "range" ){
                                                           
                           var arange = " From: <input type='text' id='" + cvid + "_from'/>" +
                                        " To: <input type='text' id='" + cvid +  "_to'/>" +
                                        " Sequence: <input type='text' id='" + cvid +  "_seq'/>";  
                           var divAdd = "<div class='bkd-rep-fld'>" + arange + " <input type='button' id='" + cvid + "_add'/></div>";             

                           $( "#" + flist[i].value[k].id ).append( divAdd );
                           $( "#" + flist[i].value[k].id + "_add" ).attr('value', 'Add Range');
                           $( "#" + flist[i].value[k].id + "_add" ).on( 'click', function (event) {
 
                              var prefix= event.currentTarget.id.replace('_add','_');
                              
                              var sfr = $("#"+event.currentTarget.id.replace('_add','_from')).val();
                              var sto = $("#"+event.currentTarget.id.replace('_add','_to')).val();
                              var seq = $("#"+event.currentTarget.id.replace('_add','_seq')).val();
                                    
                              var ifr = Number( sfr.replace( '.', '' ) );
                              var ito = Number( sto.replace( '.', '' ) );

                              BKDrep.frlist = []

                              $(".bkd-range").each( function( index, elem){
                                   BKDrep.frlist.push( elem.id );                                 
                              });
                              
                              var fmax = 0;
                              
                              for(var x=0; x < BKDrep.frlist.length; x++ ){                              
                                 var icur = Number( BKDrep.frlist[x].replace( prefix, '' ) ); 
                                 if(  icur > fmax ){
                                   fmax = icur;
                                 }
                              }

                              fmax = fmax + 1;
                              var cid = prefix + fmax;
                              var crange = " From: " + ifr + " To: " + ito;  

                              $( "#" + event.currentTarget.id.replace('_add','') )
                                  .append(" <div class='bkd-rep-fld bkd-range' id='" + cid + "'>"+ crange + " <input type='button' id='"+cid+"_drop'/></div>\n");
                              $("#"+cid+"_drop").attr('value', 'Drop Range');
                              $("#"+cid+"_drop").on( 'click', function (event) {
                                    var idDrop = event.currentTarget.id.replace("_drop","");
                                    $("#" + idDrop ).remove();
                              })

                           }); 
                        }                     
                     }    // edit line: end

                     if( flist[i].value[k].list ){  // build a list of values
                       
                       if( cval.length>0 ){

                          var clist = cval; 
                          for(var m=0; m <clist.length;m++){
                            
                            if(flist[i].value[k].type){

                              if( flist[i].value[k].type == "xref" ){
                              
                                var cval = BKDlink.xref(clist[m]);
                                var cid = cvid + "_" + m;
                                $( tgtAnchor + " > div:last-child > div:last-child")
                                  .append(" <div class='bkd-rep-fld  bkd-xref' id='"+cid+"'>" + cval +" <input type='button' id='"+cid+"_drop'/></div>\n");
                                $("#"+ cid).append("<input type='hidden' id='"+cid+"_ns' class='bkd-report' />");
                                $("#" + cid + "_ns").val(clist[m].ns);
                                $("#"+ cid).append("<input type='hidden' id='"+cid+"_ac' class='bkd-report' />");
                                $("#" + cid + "_ac").val(clist[m].ac);
                                $("#"+ cid).append("<input type='hidden' id='"+cid+"_tns' class='bkd-report' />");
                                $("#" + cid + "_tns").val(clist[m].cvType.ns);
                                $("#"+ cid).append("<input type='hidden' id='"+cid+"_tac' class='bkd-report' />");
                                $("#" + cid + "_tac").val(clist[m].cvType.ac);
                                $("#"+cid+"_drop").attr('value', 'Drop Xref');
                                $("#"+cid+"_drop").on( 'click', function (event) {
                                    var idDrop = event.currentTarget.id.replace("_drop","");
                                    $("#" + idDrop ).remove();
                                  }); 
                                  
                              }
                              
                              if(flist[i].value[k].type == "range"){                                
                                var cid = cvid + "_" + m;
                                var crange = " From: " + clist[m].start +
                                             " To: " + clist[m].stop +
                                             " Seq: " + clist[m].sequence;  

                                $( tgtAnchor + " > div:last-child > div:last-child")
                                  .append(" <div class='bkd-rep-fld bkd-range' id='"+cid+"'>"+ crange + " <input type='button' id='"+cid+"_drop'/></div>\n");
                                $("#"+ cid).append("<input type='hidden' id='"+cid+"_start' class='bkd-report' />");
                                $("#" + cid + "_start").val(clist[m].start); 
                                $("#"+ cid).append("<input type='hidden' id='"+cid+"_stop' class='bkd-report' />");
                                $("#" + cid + "_stop").val(clist[m].stop);
                                $("#"+ cid).append("<input type='hidden' id='"+cid+"_sequence' class='bkd-report' />"); 
                                $("#" + cid + "_sequence").val(clist[m].start);

                                $("#"+cid+"_drop").attr('value', 'Drop Range');
                                $("#"+cid+"_drop").on( 'click', function (event) {
                                    var idDrop = event.currentTarget.id.replace("_drop","");
                                    $("#" + idDrop ).remove();
                                  });                                   
                              }
                            }else{                             
                              $( tgtAnchor + " > div:last-child > div:last-child")   
                                  .append(" <div class='bkd-rep-fld'>"+clist[m] +"</div>\n");
                            }
                          }
                       }
                       
                     } else {  // simple value (eg feature parameters)
                             
                       if(cvedit && mode == 'edit'){  // set up edit field
                        
                         if( flist[i].value[k].type =="cvterm" ){
                         
                           // build cvterm  menu
                           var cvtsel ="<select id='"+flist[i].value[k].id+"_cvt' class='bkd-report'>";
                           for(var n = 0; n< flist[i].value[k]["cvt-list"].length; n++){
                            cvtsel = cvtsel +"<option value='" +
                                flist[i].value[k]["cvt-list"][n].value+"'>" +
                                flist[i].value[k]["cvt-list"][n].name+"</option>";
                           }
                           cvtsel = cvtsel + "</select>";
                               
                           $( tgtAnchor + " > div:last-child ")   
                               .append(" <div class='bkd-rep-fld'>" + cname +": " + 
                                       cvtsel + 
                                       " </div>\n");
           
                           if( cval !== null){ 
                             var cvtvalue = cval.ac; 
                             var cvtname = cval.name;
                             
                             $( "#" + flist[i].value[k].id +"_cvt  option[value='"+cvtvalue+"']" ).attr("selected",true);
                             $( "#" + flist[i].value[k].id +"_cvt" ).val(cvtvalue);
                           }
                         } else {
                           $( tgtAnchor + " >div:last")
                             .append(" <div class='bkd-rep-fld'>" + cname + ": <input type='text' id='"+cvid+"' class='bkd-report'/></div>\n");
                           $( '#' + cvid ).val(cval);
                           
                         }
                       } else {                         
                         $( tgtAnchor + " >div:last")
                           .append(" <div class='bkd-rep-fld'>"+cname +": "+cval+"</div>\n");
                       }
                     }
                   }
                }
            }
          } else {  // config field is a single value
             console.log("single");    
             var vpath = [];
             if( flist[i].vpath){
               vpath =flist[i].vpath;
             }
             var fval = null; 
             if(vpath.length >0){
               fval = data['report'][vpath[0]];
               for(var j=1; j<vpath.length; j++){
                 if( fval[vpath[j]] ){
                   fval = fval[vpath[j]];
                 } else {
                   fval = null;
                   break;
                 }                 
               }
             }
            console.log("fval: "+fval);
             if( fval !== null ){
               console.log("fval: ok " + flist[i].type);
               if( flist[i].type ){
                 if(flist[i].type == 'taxon'){
                   var fval = BKDlink.taxid( fval );
                   $(tgtAnchor).append("<div class='bkd-rep-fld'>"+fname+ ":"+ fval +"</div>");                 
                 }else if( flist[i].type == 'hidden'){
                   console.log("AC");
                   $(tgtAnchor).append( "<input type='hidden' class='bkd-rep-fld bkd-report' id='"+flist[i].id+"'/>");
                   $("#" + flist[i].id).val(fval);
                 }
               } else {  // string value                 
                 if( flist[i].edit && mode == 'edit' ){
                   $(tgtAnchor).append("<input type='text' size='32' maxlength='64' class='bkd-rep-fld'>"+fval+"</input>");   
                 } else {
                   $(tgtAnchor).append("<div class='bkd-rep-fld'>"+fname+ ": "+fval+"</div>");
                 }
               }
             }
          } 
        }
      },
      
      valView: function(data,valAnchor ){
      
        if( data == null ){
            $( valAnchor).hide();
        } else {
            $( valAnchor ).show();
        }

        var flist = BKDconf["report"]["feature"]["protein"]["value"];
        for( var i = 0; i < flist.length; i++){
          var fname = flist[i].name;
          if( data['report-value'][flist[i].value] ){
                     
              fval = data['report-value'][flist[i].value]['value'];
              $(valAnchor).append("<div class='bkd-rep-fld'>\n"+
                                  " <div class='name'>"+ fname+"</div>\n"+
                                  " <div class='value'>"+fval+"</div>\n"+
                                  "</div>\n");
          }
        }
      },

      valEdit: function( data, valAnchor ){
      
        if( data == null ){   
            $( valAnchor).hide();
        } else {
            $( valAnchor ).empty();
            $( valAnchor ).show();            
        }

        $(valAnchor).append("<form id='rep-val' name='report'" +
                    " action='report.action' method='post'>"); 
        
        var flist = BKDconf["report"]["feature"]["protein"]["value"];
        
        for( var i = 0; i < flist.length; i++){
          var flabel = flist[i].name;
          var fname = flist[i].value;
          var fid = flist[i].id;
          var fdata = '';
          if( data!== null && data['report-value'][flist[i].value] !=null ){
              fdata = data['report-value'][flist[i].value]['value'];
          }

          $( valAnchor +" > form " ).append( "<div class='bkd-rep-fld'>\n"+
                                             " <div class='name'>"+ flabel+"</div>\n"+
                                             "</div>" );
          $( valAnchor +" > form > div:last" )
             .append( "<textarea name='" + fname +"'" +
                        " cols='128' rows='4'" +
                        " ns='" + flist[i].ns + "' ac='" + flist[i].ac + "' " +
                        " value='' id='" + fid  +"' class='bkd-report'/>" );

          if( data == null){
            $( valAnchor +" > form #" + fid )
               .attr('disabled','disabled');
          } else {
            if( data != null && fdata.length > 0){
              $( valAnchor +" > form #" + fid )
                 .val(fdata);
            }
          }
        }

        $( valAnchor +" > form > div:last" )
           .append("<div><input type='button' id='" + "report_submit" + "'/></div>\n");
        $("#"+"report_submit").attr('value', 'Submit Report');
        $( "#" + "report_submit" ).on( 'click', function(event){

            $( ".bkd-report").each(function(index,el){
             try{
              //if( el.is("input") ){
                console.log( el.id + " : " + el.value );
              //}
             }catch(err){
               console.log( el.id + " : " + el );
             }
            });
            alert("submit!!!");
              
          });
                                           
      }
};

