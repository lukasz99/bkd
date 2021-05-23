import os
import pymex
from pymex import xmlrecord

class UniRecord(xmlrecord.XmlRecord):

        def __init__(self, root=None):
                myDir = os.path.dirname( os.path.realpath(__file__))
                self.uniConfig = { "uni001": {"IN": os.path.join( myDir, "defUniParse001.json"),
                                              "OUT": os.path.join( myDir, "defUniXml001.json" ) }
                                   }
                super().__init__(root, config=self.uniConfig )
                                   
        def parseXml(self, filename, ver="uni001", debug=False):
            return super().parseXml( filename, ver=ver )

        
