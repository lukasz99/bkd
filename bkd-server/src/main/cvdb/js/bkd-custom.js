BKDcustom = {
    "callback":{

        "report-tgt-edit": function(){
            
        },
        
        "report-tgt-view": function( args ){
            console.log("report-tgt-view: args ->", args);
            $(args.anchor).append("<div>report-tgt-view</div>");
            
        }
               
    }
}
