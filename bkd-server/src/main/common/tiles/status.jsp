<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<HTML>
 <HEAD>
  <link rel="stylesheet" href="css/dip2.css" type="text/css" title="dip2">
  <link rel="stylesheet" href="css/dip2tab.css" type="text/css" title="dip2">
  <TITLE>DIP Proxy</TITLE>
  <s:head/>
 </HEAD>

 <BODY onLoad="self.name='DIP_MA'; self.focus()">
  <SCRIPT TYPE="text/javascript" SRC="script/proxy.js" LANGUAGE="JavaScript"></SCRIPT>
  <center>
   <t:insertAttribute name="header" />
   <hr/> 
   <t:insertAttribute name="body" />
   <hr/>
   <t:insertAttribute name="footer" />
  </center>
 </BODY>
</HTML>
