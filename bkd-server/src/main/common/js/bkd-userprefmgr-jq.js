console.log("bkd-userpref: common");

class BkdUserPrefMgr {
    
    constructor( conf ){
        
        if( conf !== undefined ){
            this.conf = conf;
        } else {
            this.conf = {   // defaults
                form: "#uprefmgr-form"
            };
        }
        
        this.anchor = "";
        this.data = {uid:null};        
    }

    initialize( init ){
        console.log( "bkd-userprefmgr: initialize");
        console.log( "init: ", init );
        if( init['loginid'] !== undefined ){
            this.data.uid= init['loginid'];
            
            var payload = { 'op.view':'view',
                            'id': this.data.uid                            
                          };
            
            $.post( this.conf.url, payload,
                    function( response ){
                        console.log(response.preferences);
                        uprefmgr.data.preferences
                            = JSON.parse(response.preferences);
                        uprefmgr.buildView();
                    });
        }
    }
    
    buildView(){  
        console.log("BkdUserPrefMgr.view()");       
        var html = '';        
        html += this.traverse( this.data.preferences, this.buildProcess, 0 );        
        $(this.conf.anchor).append( html );
        console.log ( "BkdUserPrefMgr.view(): DONE" );
    }

    updateView(){
        console.log ( "BkdUserPrefMgr.updateView()" );
        this.traverse( this.data.preferences, this.updateProcess );
    }
    
    submit(){
        var payload = $(this.conf.form).serialize();
        
        var submitUrl = this.conf.url
            + "?op.update=update"
            + "&id=" + this.data.uid;
        
        $.post( submitUrl, payload,
                function( response ){
                    console.log(response.preferences);
                    uprefmgr.data.preferences
                        = JSON.parse(response.preferences);
                    uprefmgr.updateView();
                });        
    }
    
    setDefaults(){
        
        var payload = { 'op.defset':'defset',
                        'id': this.data.uid                            
                      };
        
        $.post( this.conf.url, payload,
                function( response ){
                    console.log(response.preferences);
                    uprefmgr.data.preferences
                        = JSON.parse(response.preferences);
                    uprefmgr.updateView();
                });
    }
     
    traverse( object, func, level ){

        var html = '';
        
        for (var i in object) {                   
            if(i =="option-def"){
                html += "\n<div class='cfg-block-list'>\n";
                for( var j = 0; j < object.options.length; j++ ){
                    
                    var strong = false;
                    
                    if( object["option-def"][object.options[j]]["legend"] !== undefined){

                        if( level > 0 ){
                            html += "<div class='cfg-block-legend-inner'>";
                        } else {
                            html += "<div class='cfg-block-legend'>";
                        }
                        html += "\n<fieldset>\n";
                        html += "<legend>"
                            + object["option-def"][object.options[j]]["legend"]
                            + "</legend>";
                        strong = true;
                    }else{
                        html += "<div class='cfg-block-no-legend'>";   
                    }
                    
                    html += func
                        .apply( this, [ j, 
                                        object["option-def"][object.options[j] ], 
                                        object["options"], 
                                        object["option-def"][object.options[j]]["opp"],
                                        strong
                                      ] ); 
                    
                    //going to step down in the object tree!!
                    
                    html += this
                        .traverse( object[ "option-def"][ object.options[j] ], 
                                   func, level+1 );
                    
                    if( object["option-def"][object.options[j]]["legend"] !== undefined){
                        html += "\n</fieldset>\n";
                    }
                    html += "</div>\n";
                    
                }
                
                html+="</div>\n";                    
            }
        }
        return html;
    }
    
    buildProcess( key, value, options, opp, strong ){
        
        if( typeof value.value != "undefined"){
            
            var keyClass = "cfg-key"; 
            
            if( value.type == "text" ){
                var keyClass = "cfg-text-key";
                if( strong ){
                    keyClass = "cfg-text-key-strong";
                }
                
                return "<div class='cfg-key-val'>" 
                    + "<div class='" + keyClass + "'>" + value.label + "</div>" 
                    + "<div class='cfg-val' id='opp." + opp + "'>" 
                    + this.htmlStringText( options[key], opp,
                                           value.value, value.size )
                    + "</div>"
                    + "</div>";
            } else {
                var keyClass = "cfg-key";
                if( strong ){
                    keyClass = "cfg-key-strong";
                }
                return "<div class='cfg-key-val'>" 
                    + "<div class='" + keyClass + "'>" + value.label + "</div>" 
                    + "<div class='cfg-val' id='opp." + opp + "'>" 
                    + this.htmlBoolRadio( options[key], opp,
                                          value.value )
                    + "</div>"
                    + "</div>";
            }
        }
        return "";
    }

    updateProcess( key, value, options, opp, strong  ){   

        // NOTE: FIX ME -> form does not update !!!
        
        if( typeof value.value != "undefined" ){                
            var valDiv = $( "#opp." + opp );
            if( valDiv !== undefined ){
                
                if( value.type=="text" ){                                          
                    valDiv.innerHTML 
                        = this.htmlStringText( key, opp, value.value,value.size );
                }
                if( value.type=="boolean"){                                          
                    valDiv.innerHTML 
                        = this.htmlBoolRadio( key, opp, value.value );
                }

                
                
            }
        }
    }
    
    htmlBoolRadio( optName, optOpp, optValue ){
        
        if( optValue ==='true'){
            var checkboxT = '<input type="radio" id="' 
                + optName +'True" name="opp.' + optOpp + '"' 
                +' value="true" checked="checked" ><strong>True</strong></input>';
            var checkboxF = '<input type="radio" id="' 
                + optName +'False" name="opp.' + optOpp + '"' 
                +' value="false">False</input>';
        }else{
            var checkboxT = '<input type="radio" id="' 
                + optName +'True" name="opp.' + optOpp + '"' 
                + ' value="true">True</input>';
            var checkboxF = '<input type="radio" id="' 
                + optName +'False" name="opp.' + optOpp +'"' 
                +' value="false" checked="checked" ><strong>False</strong></input>';
        }
        var html = "<div class='cfg-val'>" + checkboxT + " " +  checkboxF +"</div>";
        return html;
    }

    htmlStringText( optName, optOpp, optValue, size ){
        
        var textBox = '<input type="text" id="' + optName 
            + '" name="opp.' + optOpp + '" size="' + size + '"' 
            +' value="'+optValue+'" />';
        
        var html = "<div class='cfg-val'>" + textBox +"</div>";
        return html;
    }
    
}

console.log("bkd-userpref: loaded");
