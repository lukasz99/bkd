from pronto import Ontology

class CV():

    def __init__(self, url):
        self.ontology = Ontology(url)
        self.byName = {}
        for t in self.ontology:
            self.byName[self.ontology[t].name.lower()] = self.ontology[t]
            
    def getByName( self, name ):
        if name.lower() in self.byName:
            return self.byName[name.lower()]
        return None
    
    def getById( self, id ):
        if id in self.ontology:
            return self.ontology[id]
        return None

class MI(CV):
    def __init__(self):
        CV.__init__(self,'https://www.ebi.ac.uk/ols/ontologies/mi/download')
                
        for t in self.ontology:
            syn = self.ontology[t].synonyms
            for s in syn:
                sval = s.description
                if s.type is not None and s.type.id == 'PSI-MI-alternate':  
                    self.byName[sval.lower()] = self.ontology[t]
                if s.type is not None and s.type.id == 'PSI-MI-short':  
                    self.byName[sval.lower()] = self.ontology[t]

                    
                    #print(sval.lower(),self.byName[sval.lower()])
        #print(self.ontology["MI:0448"].synonyms)
        #xx
        
print("CV: import")
