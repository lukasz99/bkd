#!/usr/bin/python3

import sys
import zeep

print(sys.path)
sys.path.append( "./pylib/bkdpy" )

import bkdclient as bc

bkc = bc.BkdClient()

print(bkc.getnode("bkd", "bkd-1234N", detail='default', format='dxf14'))






