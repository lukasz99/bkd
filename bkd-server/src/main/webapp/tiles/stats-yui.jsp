<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<h1>Curation Progress: IMEx Pipeline</h1>

 <script src="js/stats-yui.js" type="text/javascript"></script>
 <script src="js/pubmgr-yui.js" type="text/javascript"></script> 
 
 <div class="yui-skin-sam" width="100%">   
  <br/>
  <div id="statstab"  class="statstab"></div>
  <br/>
  <div>
  NOTE:<br/>
  <div style="margin:0 0 0 1.5em">
    * - number records with assigned IMEx accession.
  </div>
 </div>
  <br/><br/><br/><br/><br/>
 </div>
 
 <script type="text/javascript">
  YAHOO.util.Event.addListener( window, "load", YAHOO.imex.stats ) ;
 </script>

<br/>
<br/>
<br/>
<br/>
