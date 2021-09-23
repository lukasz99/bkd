<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="t" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<div>
 <b>Requested By:</b> <s:property value="pub.owner.login" />
 <hr/>
 <!--<b>Score X:</b>0.123 <b>Score Y:</b> 0.123 -->

 <s:if test="pub.source.title.length() > 0">
  <i><s:property value="pub.source.title" /></i>
  <s:if 
    test="pub.volume.length() > 0"><s:property value="pub.volume" /></s:if><s:if
    test="pub.issue.length() > 0">(<s:property value="pub.issue" />)</s:if><s:if
    test="pub.pages.length() > 0">:<s:property value="pub.pages" /></s:if><s:if
    test="pub.year.length() > 0">, <s:property value="pub.year" />
  </s:if>
 </s:if>

 <s:if test="pub.pmid.length() != 0">
   [PUBMED:<a target="icentral_outlink" href="http://www.ncbi.nlm.nih.gov/pubmed/<s:property value='pub.pmid'/>"><s:property value="pub.pmid"/></a>]
 </s:if>

 <s:if test="pub.source.title.length() > 0 or pub.pmid.length() != 0">
  <hr/>
 </s:if>

 <b>Title:</b> <s:property value="pub.title" />

 <s:if test="pub.author.length() > 0">
  <hr/>
  <b>Author(s):</b> <s:property value="pub.author" />
 </s:if>

 <s:if test="pub.abstract.length() > 0">
  <hr/>
  <b>Abstract:</b> <s:property value="pub.abstract" />
 </s:if>
</div>
<div>
 <br/><br/><br/>
</div>
