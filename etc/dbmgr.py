#!/usr/bin/python3

import os
import sys
import argparse
import subprocess

#import psycopg2
#from psycopg2 import sql
#from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# defaults

dbhost = "10.1.7.203"
dbname = "cvdb_flip"
dbuser = "bkd"
dbpass = "444bkd444"

sqlfile = "bkd-v06.sql"

mypath = os.path.dirname( os.path.realpath(__file__) )
sqlfile = os.path.join( mypath, sqlfile )

parser = argparse.ArgumentParser( description='BKD database reset tool')

parser.add_argument('--file', '-f', dest="sqlf", type=str,
                    required=False, default=sqlfile,
                    help='SQL initialization file')

parser.add_argument('--host', '-H', dest="dbhost", type=str,
                    required=False, default=dbhost,
                    help='Database host')

parser.add_argument('--dbname', '-D', dest="dbname", type=str,
                    required=False, default=dbname,
                    help='Database name')

parser.add_argument('--dbuser', '-u', dest="dbuser", type=str,
                    required=False, default=dbuser,
                    help='User name')

parser.add_argument('--dbpass', '-p', dest="dbpass", type=str,
                    required=False, default=dbpass,
                    help='User password')

parser.add_argument('--mode', '-m', dest="mode", type=str,
                     required=True, choices=['users','reports'])

parser.add_argument('--dump-file', '-df', dest="file", type=str,
                     required=True)


args = parser.parse_args()

sqlfile = args.sqlf
dbhost = args.dbhost
dbname = args.dbname
dbuser = args.dbuser
dbpass = args.dbpass
dpfile = args.file

print("BKD database reset tool\n")
print(" SQL File:" , sqlfile,"\n") 
print(" PSQL Host:" , dbhost) 
print(" PSQL DB:" , dbname) 
print(" PSQL User:" , dbuser) 
print(" PSQL Pass:" , dbpass) 


tbl = { "users": [ 'role', 'usr', 'grp' ],
        "reports": [ 'report','rep_pkey_seq' ] } 


table = []

with open( sqlfile, 'r' ) as sfh:
    
    for ln in sfh:
        if 'CREATE' in ln and ('TABLE' in ln or 'SEQUENCE' in ln):
            for t in tbl[args.mode]:                
                if t in ln:
                    fld = ln.strip().split()
                    #print(fld)
                    for f in fld:                
                        if t in f:
                            table.append(f)


cmd = ["pg_dump","-h", dbhost,"-U",dbuser, "-a"]
cmd = cmd + ['-f',dpfile]
cmd = cmd + (" -t " + " -t ".join(table)).split() + [dbname]

subprocess.run(cmd)

