#!/usr/bin/python3

import os
import sys
import argparse

import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# defaults

dbhost = "10.1.7.203"
dbname = "cvdb_flip"
dbuser = "bkd"
dbpass = "444bkd444"

sqlfile = "bkd-v06.sql"

mypath = os.path.dirname( os.path.realpath(__file__) )
sqlfile = os.path.join( mypath, sqlfile )

parser = argparse.ArgumentParser( description='BKD database reindex tool')

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

args = parser.parse_args()

dbhost = args.dbhost
dbname = args.dbname
dbuser = args.dbuser
dbpass = args.dbpass

print("BKD database reset tool\n")
print(" PSQL Host:" , dbhost) 
print(" PSQL DB:" , dbname) 
print(" PSQL User:" , dbuser) 
print(" PSQL Pass:" , dbpass) 

try:
    con = psycopg2.connect( host=dbhost, dbname=dbname,
                            user=dbuser, password=dbpass )

except Exception as e:
    print( "Can't connect. Invalid dbname, user or password?" )
    print(e)
    sys.exit()

    
try:    
    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur1 = con.cursor()
    cur1.execute( "select pkey from feature;" )
    
    for pk in cur1:
        cur2 = con.cursor()
        cur2.execute( "select r.rstart,r.rstop, r.sequence"
                      + " from range as r "
                      + " where r.fk_feature = %s ;", (pk) )
        pidx = 0
        pflag = False
        for ss in cur2:            
            if pflag:
                pidx = 0
            else:
                print(ss)
                if len(ss) == 3 and ss[0] == ss[1] and ss[2] is not None and len(ss[2]) == 1:
                    pidx = ss[0]
                    sidx = ss[2]
                    pflag = True
            
        if pflag and pidx != 0:

            print( "Feature PK: %d %s PosIDX: %d  SeqIDX: %s"
                   % ( pk[0], pflag, pidx, sidx) )
        
            cur2.execute( "update feature"
                          + " set posidx = %s, seqidx = %s"
                          + " where pkey= %s;", (pidx,sidx, pk))
            
        cur2.close()
    
        sys.stdout.flush()
    cur1.close()

    con.close()

except Exception as e:
    print(e)
    sys.exit()



