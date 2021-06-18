<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<table class="fnews" id="newsbox">
</table> 

<script>
  YAHOO.namespace("mbi.news");

  YAHOO.mbi.news.newsbox = {

    build: function ( o ) { 

      var messages = YAHOO.lang.JSON.parse( o.responseText );
      var id = o.argument.id;  
      var feed = o.argument.feed;  
      var label = messages.years[0];
      var src = feed+'?ret=nbox&year=' + label; 
         
      var buildCallback = { cache:false, timeout: 5000,
                            success:YAHOO.mbi.news.newsbox.display,
                            argument:{ id:"newsbox", feed:feed, n:"3", width:"32", yi:"0"} }; 
       
      YAHOO.util.Connect.asyncRequest( 'GET', src, 
                                       buildCallback );

    },

    display: function ( o ) {

      var messages = YAHOO.lang.JSON.parse( o.responseText );
      var id = o.argument.id;
      var feed = o.argument.feed;  
      var n = o.argument.n;
      var width = o.argument.width;

      var nbox = YAHOO.util.Dom.get(id);

      for( var i=0; i < n; i++) {
        if( i < messages.nbox.length ) {
          var cdate = messages.nbox[i].date;
          var chead = messages.nbox[i].header;
                
          if( chead.length > width ) {
               chead = chead.substring(0, width);
               chead = chead.substring(0, chead.lastIndexOf( ' ' ) )+'...'; 
          }

          var dateRowNode = document.createElement('tr');  
          var dateCellNode = document.createElement('td');  
          var dateTextNode = document.createTextNode(cdate);  
          dateCellNode.appendChild(dateTextNode);
          YAHOO.util.Dom.addClass(dateCellNode,"fnews-date"); 

          dateRowNode.appendChild(dateCellNode);           
          nbox.appendChild(dateRowNode);
                      
          var headRowNode = document.createElement('tr');  
          var headCellNode = document.createElement('td');  
          var headTextNode = document.createTextNode(chead);  
          headCellNode.innerHTML = chead;
          YAHOO.util.Dom.addClass(headCellNode,"fnews-head"); 
          headRowNode.appendChild(headCellNode);           
          nbox.appendChild(headRowNode);

        } else {
          var nyi = 1+parseInt(o.argument.yi);
          var nn = n-i;
          var nyr = messages.years[nyi];
          var src = feed + '?ret=nbox&year=' + nyr;

          var buildCallback = { cache:false, timeout: 5000,
                                success:YAHOO.mbi.news.newsbox.display,
                                argument:{ id:"newsbox", feed:feed, n:nn, yi:nyi} }; 
       
          YAHOO.util.Connect.asyncRequest( 'GET', src, 
                                           buildCallback );
          i = n;  
        }
      }
    },

    init : function ( feed ) {
     
      var initCallback = { cache:false, timeout: 5000, 
                          success:YAHOO.mbi.news.newsbox.build,
                          argument:{ id:"newsbox", feed:feed} };
                       
      YAHOO.util.Connect.asyncRequest( 'GET', feed + '?ret=ylist', initCallback );

    }
  };
  YAHOO.util.Event.addListener( window, "load",
  YAHOO.mbi.news.newsbox.init( "<t:getAsString name='feed' ignore='true'/>" ));
</script>


