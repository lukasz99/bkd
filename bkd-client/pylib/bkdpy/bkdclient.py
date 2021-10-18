from http.client import HTTPSConnection, HTTPResponse
import json
import re
import ssl

from requests import Session
from requests.auth import HTTPBasicAuth

from zeep import Client as zClient, Settings as zSettings
from zeep.transports import Transport

from lxml import etree as ET

class BkdClient():
 
    def __init__( self, user='guest', password='guest',
                  mode='dev', debug=False ):

        self.dxfns = { 'dxf': 'http://dip.doe-mbi.ucla.edu/services/dxf20' }

        self.user = user
        self.password = password
        self.mode = mode
        self.debug = debug    
        
        url = 'https://imexcentral.org/bkdev/services/soap?wsdl'
 
        if mode == 'dev':
            #url = 'https://imexcentral.org/bkdev/services/soap?wsdl'
            #url = 'http://localhost:9999/bkdev/services/soap?wsdl'
            url = 'http://10.1.7.100:9999/cvdbdev0/services/soap?wsdl'
            #url = 'http://10.1.7.100:9999/dipdev0/services/soap?wsdl'
             
        if self.debug:
            print(url)
            print(self.user)
            print(self.password)

        self._zsettings = zSettings(strict=False, xml_huge_tree=True)

        self._zsession = Session()
        
        self._zsession.verify = False
        # self._zsession.auth = HTTPBasicAuth(self.user, self.password) 

        self._zclient = zClient(url,
                               settings=self._zsettings,
                               transport=Transport(session=self._zsession))
        
        self._dxfactory = self._zclient.type_factory('ns1')
        self._ssfactory = self._zclient.type_factory('ns0')
        
        if self.debug:
            print(self.zclient)
            print("\nDONE: __init__") 

    @property
    def dxf(self): 
        return self._dxfactory

    @property
    def ssf(self):
        return self._ssfactory

    def getnode( self, ns, ac, detail='default', format='dxf20', debug = False ):
        print("BkdClinet: getnode")
        client = self._zclient                 
        try:
            with client.settings(raw_response=True):
                node = self._zclient.service.getNode( ns = ns, ac = ac,
                                                      detail='default',
                                                      format='dxf20')
                tree = ET.fromstring(node.text)
                dset = tree.xpath('//dxf:dataset',namespaces = self.dxfns )
                if dset:
                    return dset[0]
        except Exception as e:
             print( e )
        return None
    
    def getlink( self, ns, ac, detail='default', format='dxf15' ):
        print("BkdClinet: getlink")
        client = self._zclient
        try:
            with client.settings(raw_response=True):
                link = client.service.getLink( ns = ns, ac = ac,
                                               detail=detail,
                                               format='dxf15')
                tree = ET.fromstring(link.text)                
                dset = tree.xpath('//dxf:dataset',namespaces = self.dxfns )
                if dset:
                    return dset[0]
        except Exception as e:
             print( e )
        return None

    def getsource( self, ns, ac, detail='default', format='dxf15' ):
        print("BkdClinet: getsource")
        client = self._zclient
        try:
            with client.settings(raw_response=True):
                source = client.service.getSource( ns = ns, ac = ac,
                                                   detail=detail,
                                                   format='dxf15')
                tree = ET.fromstring(source.text)
                dset = tree.xpath('//dxf:dataset',namespaces = self.dxfns )
                if dset:
                    return dset[0]
        except Exception as e:
             print( e )
        return None

    def getevid( self, ns, ac, detail='default', format='dxf15' ):
        print("BkdClinet.getevid: detail=" + detail)
        client = self._zclient
        try:
            with client.settings(raw_response=True):
                evid = client.service.getEvidence( ns = ns, ac = ac,
                                                   detail=detail,
                                                   format='dxf15')
                tree = ET.fromstring(evid.text)
                dset = tree.xpath('//dxf:dataset',namespaces = self.dxfns )
                if dset:
                    return dset[0]
        except Exception as e:
             print( e )
        return None


                    
    def setnode( self, zdtsnode, mode = "add", debug = False):

        if debug:
            print("BkdClinet.addnode: input node=" + str(zdtsnode))
        #else:
        #    print("BkdClinet.addnode: input node=",len(str(zdtsnode)))
        if zdtsnode is not None:
            client = self._zclient
            #try:

            if debug:
                print( ET.tostring(client.create_message(client.service,'setNode', dataset= zdtsnode, mode="add"), pretty_print=True ).decode()  )
            else:
                with client.settings(raw_response=True):
                    res = client.service.setNode( zdtsnode, mode )
                    restree = ET.fromstring(res.text)
                    #print("RES",res.text)
                    dset = restree.xpath('//dxf:dataset',namespaces = self.dxfns )
                    
                    #print("\n\n",ET.tostring(dset[0], pretty_print=True).decode(),"\n\n" )
                    if dset:
                        return dset[0]
            
        return None

    def setnode2( self, zdtsnode, mode = "add", debug = False ):
        print("#############################")
        if debug:
            print("BkdClinet.addnode: input node=" + str(zdtsnode))
        #else:
        #    print("BkdClinet.addnode: input node=",len(str(zdtsnode)))
        if zdtsnode is not None:
            client = self._zclient
            #try:

            if debug:
                print( ET.tostring(client.create_message(client.service,'setNode', dataset= zdtsnode, mode="add"), pretty_print=True ).decode()  )
            else:

                #print(dir(client.transport))
                #print("\n\n",dir(client.service.setNode),"\n\n")
                
                with client.settings(raw_response=True):
                    res = client.service.setNode( zdtsnode, mode )
                    restree = ET.fromstring(res.text)
                    #print("RES",res.text)
                    dset = restree.xpath('//dxf:dataset',namespaces = self.dxfns )
                    
                    #print("\n\n",ET.tostring(dset[0], pretty_print=True).decode(),"\n\n" )
                    if dset:
                        return dset[0]
            
        return None
    
print("BkdClient: import")


    
