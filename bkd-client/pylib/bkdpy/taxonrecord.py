import os

from urllib.request import urlopen
import pymex

print("TaxonRecord: import")

class TaxonRecord( pymex.xmlrecord.XmlRecord ):
        def __init__(self, root=None):
                myDir = os.path.dirname( os.path.realpath(__file__))
                self.taxConfig = { "tax001": {"IN": os.path.join( myDir, "defTaxonParse001.json"),
                                              "OUT": os.path.join( myDir, "defTaxonXml001.json" ) }
                }
                
                self.url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&retmode=xml&id=%%ACC%%"
                
                super().__init__(root, config=self.taxConfig )
                                   
        def parseXml(self, filename, ver="tax001", debug=False):
                return super().parseXml( filename, ver=ver )

        def getRecord(self, ac="9606"):
                taxUrl = self.url.replace( "%%ACC%%", ac )                
                
                res = self.parseXml( urlopen(taxUrl) )
                return( res )
