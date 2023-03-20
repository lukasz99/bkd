
BkdNews = {

    tabstat:{},
    
    boxinit : function ( anchor, feed ) {
        this.boxanchor = anchor;
        this.feed = feed;
        var listfeed = this.feed +"?ret=ylist";
        
        $.ajax( { url: listfeed} )
            .done( function(data, textStatus, jqXHR){                  
                BkdNews.boxdata( data ) } );                
    },
    
    tabinit: function(anchor, feed ){
        this.tabanchor = anchor;
        this.feed = feed;

        var listfeed = this.feed +"?ret=ylist";
        $.ajax( { url: listfeed} )
            .done( function(data, textStatus, jqXHR){                  
                BkdNews.tabdata( data ) } );        
    },

    tabdata: function( data ){

        var tdata = "<td class='news-data' colspan='"+(data.years.length+1)+"'></td>";
        $( this.tabanchor + " .news-data-panel" ).append(tdata);
        
        for(var i = 0 ; i < data.years.length; i++ ) {
            var label = data.years[i];
            var show = false;
            this.tabstat[label]= false;

            var datafeed = this.feed+'?ret=list&year=' + label; 
            var cclass="news-tab news-tab-off news-tab-" + label;
            if(i == 0){
                cclass="news-tab news-tab-on news-tab-" + label;
                this.tabstat[label] = true;
                show = true;
            }
            
            var cyear ="<td class='" + cclass + "'>" + label + "</td>";
            $( this.tabanchor + " .news-header" ).append(cyear);           

            var callback = function( tclass, show ){
                return function(data, textStatus, jqXHR){
                    BkdNews.tabdisplay( data, tclass, show );
                };                     
            };
            
            $.ajax( { url: datafeed} ).done( callback( "news-data-" + label, show ) );              
        }

        $( this.tabanchor + " .news-tab" )
            .click( function(event){
                console.log(event);
                var clabel = event.target.innerText;
                var cstate =  BkdNews.tabstat[clabel]; 
                console.log(cstate);
                if( cstate == false ){
                    for( var i in BkdNews.tabstat ){                        
                        if( i == clabel ){ 
                            BkdNews.tabstat[i] = true;
                        } else {
                            BkdNews.tabstat[i] = false;
                        }
                    }
                }                
                for( var i in BkdNews.tabstat ){
                    console.log(i, BkdNews.tabstat[i] );
                    if( BkdNews.tabstat[i] ){
                        // turn on
                        $( BkdNews.tabanchor + " .news-tab-" + i ).addClass( "news-tab-on" );
                        $( BkdNews.tabanchor + " .news-tab-" + i ).removeClass( "news-tab-off" );
                        console.log("ON: " + BkdNews.tabanchor + " .news-tab-" + i);
                        $( BkdNews.tabanchor + " .news-data-" + i ).show();
                    } else {
                        // turn off
                        $( BkdNews.tabanchor + " .news-tab-" + i ).addClass( "news-tab-off" );
                        $( BkdNews.tabanchor + " .news-tab-" + i ).removeClass( "news-tab-on" );
                        console.log("OFF: " + BkdNews.tabanchor + " .news-tab-" + i);
                        $( BkdNews.tabanchor + " .news-data-" + i ).hide();
                    }                    
                }

                
            });

        
        $( this.tabanchor + " .news-header" )
            .append("<td width='95%' class='news-tab-off'>&nbsp;</td>")
        
    },

    tabdisplay: function(data, tclass, show ){
        
        $( this.tabanchor + " .news-data" )
            .append("<div class='" + tclass + "'>" + data + "</data>");

        if( show ){
            $( BkdNews.tabanchor + " ." + tclass ).show();
        } else {
            $( BkdNews.tabanchor + " ." + tclass ).hide();
        }
        
    },

    boxdata: function( data ){

        console.log(data);        
        var label = data.years[0];
        var datafeed = this.feed +"?ret=nbox&year=" + label;
        
        $.ajax( { url: datafeed } )
            .done( function( data ){                  
                BkdNews.boxdisplay( data, { n:"3", width:"32", yi:"0" } ) });        
    },

    boxdisplay: function(data, opts){
        console.log(data);
        console.log(opts);
        this.boxopts = opts;
        this.boxdata = data;

        for( var i=0; i < this.boxopts.n; i++) {
            if( i < this.boxdata.nbox.length ) {
                // add new  box entry
                
                var cdate = this.boxdata.nbox[i].date;
                var chead = this.boxdata.nbox[i].header;
                
                if( chead.length > this.boxopts.width ) {
                    chead = chead.substring(0, this.boxopts.width);
                    chead = chead.substring(0, chead.lastIndexOf( ' ' ) )+'...'; 
                }
                
                var daterow = "<tr><td class='fnews-date'>"
                    + cdate
                    + "</td></tr>";
                
                $( this.boxanchor ).append( daterow );
                
                var headrow = "<tr><td class='fnews-head'>"
                    + chead
                    + "</td></tr>";
                
                $( this.boxanchor ).append( headrow );
                
            } else {
                // add previous year: LS: fix me
                /*
                var nyi = 1+parseInt(o.argument.yi);
                var nn = n-i;
                var nyr = messages.years[nyi];
                if( messages.years[nyi] !== undefined ){
                    
                    var src = feed + '?ret=nbox&year=' + nyr;
                
                    var buildCallback = { cache:false, timeout: 5000,
                                          success:YAHOO.mbi.news.newsbox.display,
                                          argument:{ id:"newsbox", feed:feed, n:nn, yi:nyi} }; 
                    
                    YAHOO.util.Connect.asyncRequest( 'GET', src, 
                                                     buildCallback );
                }
                i = n;  
                */                
            }
        }                
    }
}

/*
YAHOO.namespace("mbi.news");

YAHOO.mbi.news.tabs = {

  tabInit: function( o ){ 

    var messages = YAHOO.lang.JSON.parse( o.responseText );
    var id = o.argument.id;  
    var feed = o.argument.feed;  
    var tabView = new YAHOO.widget.TabView();

    for(var i = 0 ; i < messages.years.length; i++ ) {
      var label = messages.years[i];
      var src = feed+'?ret=list&year=' + label; 

      var tab =  new YAHOO.widget.Tab({
        label: label,
        dataSrc: src ,
        active: true
        });
       YAHOO.util.Dom.addClass( tab.get('contentEl'), "news-tab");
       tabView.addTab( tab );
    }
      
    tabView.selectTab( 0 ); 
    tabView.appendTo( id ); 
  },

  build : function( feed ){
      var tabCallback = { cache:false, timeout: 5000, 
                          success:YAHOO.mbi.news.tabs.tabInit,
                          argument:{ id:"newscontainer", feed:feed } };                  
      YAHOO.util.Connect.asyncRequest( 'GET', feed+'?ret=ylist', tabCallback );
  }
};

*/
