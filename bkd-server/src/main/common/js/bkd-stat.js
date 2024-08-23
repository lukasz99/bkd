BkdStat = {
    
    stats: {},
    anchor: null,
    
    init: function(bkdgrp,anchor, show){
        console.log("BkdStat.init");
        BkdStat.anchor= anchor;
        
        if(bkdgrp != undefined){
            console.log(bkdgrp);
            
            fetch(bkdgrp)
                .then(function(response) { return response.json(); })
                .then(function(json) {
                    BkdStat.stats = json;
                    console.log("XXX:",BkdStat.stats);

                    if(show){
                        BkdStat.show(anchor);
                    }                                                
                });            
            
        } else {
            console.log("BkdStat.init: no group info");
        }
    },

    show: function(anchor){
        console.log( "BkdStat.show");
        
        $( anchor )
            .append( "The Database currently covers:" );

        var glst = BkdStat.stats["group-list"]
        
        for(var i=0; i<glst.length; i++){
            console.log(glst[i]);
        }
    }    
}
