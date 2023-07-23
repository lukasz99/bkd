BKDmodal = {
    init: function( anchor, showAnchor, url ){
        $( anchor ).hide();
        
        var hhght =  $("#header").height(); 
        var hwdth =  $("#header").width(); 
        
        $( anchor ).css('top',hhght+75);
        $( anchor ).css('width',hwdth-200);
        
        $( showAnchor )
            .on( 'click', { 'anchor':anchor, 'url': url },
                 function (event) {                     
                     $( event.data.anchor ).hide();
                     $( event.data.anchor ).empty();
                                
                     var hhght =  $("#header").height(); 
                     var hwdth = $( "#header" ).width();
                     var fpos = $( "#footer" ).position();         
                     
                     $( event.data.anchor )
                         .append("<table class='bkd-modal-header' width='100%'>"+
                                 "<tr>"+
                                 "<td align='left'>Help</td>"+
                                 "<td align='right'><div class='bkd-modal-close'>Close</div></td>"+
                                 "</tr>"+
                                 "</table>"+
                                 "<iframe class='bkd-modal-frame' src='"+event.data.url+"'></iframe>");
                     
                     $( anchor + " .bkd-modal-header").css('width',hwdth-250);
                     var hbwl = parseInt($( event.data.anchor + " .bkd-modal-header").css("border-left-width"));
                     var hbwr = parseInt($( event.data.anchor + " .bkd-modal-header").css("border-right-width"));

                     $(event.data.anchor + " .bkd-modal-frame")
                         .css( 'width', hwdth-250-hbwl-hbwr);       
                     $(event.data.anchor + " .bkd-modal-frame")
                         .height( fpos.top-hhght-75-50);
                     
                     $( event.data.anchor + " .bkd-modal-close" )
                         .on( 'click', {'anchor':event.data.anchor},
                              function (ev) {
                                  $( ev.data.anchor ).hide();
                                  $( ev.data.anchor ).empty();
                                  return false;
                              });     
                     
                     $( event.data.anchor ).show();
                     return false;
                 });     
    },
    
    showurl: function( anchor, url ){

        $( anchor ).hide();
        $( anchor ).empty();
        
        var hhght =  $("#header").height(); 
        var hwdth = $( "#header" ).width();
        var fpos = $( "#footer" ).position();         
        
        $( anchor )
            .append("<table class='bkd-modal-header' width='100%'>"+
                    "<tr>"+
                    "<td align='left'>Help</td>"+
                    "<td align='right'><div class='bkd-modal-close'>Close</div></td>"+
                    "</tr>"+
                    "</table>"+
                    "<iframe class='bkd-modal-frame' src='" + url + "'></iframe>");
        
        $( anchor + " .bkd-modal-header").css('width',hwdth-250);
        var hbwl = parseInt($( anchor + " .bkd-modal-header").css("border-left-width"));
        var hbwr = parseInt($( anchor + " .bkd-modal-header").css("border-right-width"));
        
        $( anchor + " .bkd-modal-frame").css( 'width', hwdth-250-hbwl-hbwr);       
        $( anchor + " .bkd-modal-frame").height( fpos.top-hhght-75-50);
        
        $( anchor + " .bkd-modal-close" )
            .on( 'click', {'anchor': anchor},
                 function (ev) {
                     $( ev.data.anchor ).hide();
                     $( ev.data.anchor ).empty();          
                     return false; });     
        
        $( anchor ).show();
        return false;                
    }    
 };
