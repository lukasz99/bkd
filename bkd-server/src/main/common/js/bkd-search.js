BKDSearch = {

    toFuzzy: function( query ){
        console.log("query:",query);
        if( query.includes('~') ||
            query.includes('+') ||
            query.includes('"') ||
            query.includes('*') ||
            query.includes('(') ||
            query.includes(')') ){
            
            console.log("equery:",encodeURI(query));
            return encodeURI(query);
        }
       

        var qarr = query.split(/\s+/);
        console.log(qarr);
        var farr =[]
        for( var i = 0; i < qarr.length; i++){
            
            farr.push(qarr[i]+'~');
        }
        console.log("equery:",encodeURI( farr.join(' ') ));
        return encodeURI(farr.join(' '));
    }
}
