#!/usr/bin/python3

import os
import sys
import argparse

import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# defaults

dbhost = "10.1.7.101"
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

args = parser.parse_args()

sqlfile = args.sqlf
dbhost = args.dbhost
dbname = args.dbname
dbuser = args.dbuser
dbpass = args.dbpass

print("BKD database reset tool\n")
print(" SQL File:" , sqlfile,"\n") 
print(" PSQL Host:" , dbhost) 
print(" PSQL DB:" , dbname) 
print(" PSQL User:" , dbuser) 
print(" PSQL Pass:" , dbpass) 

try:
    
    con = psycopg2.connect( host=dbhost, dbname="bkd_flip",
                            user=dbuser,password=dbpass )
    
    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = con.cursor()

    cur.execute(sql.SQL( "drop database  {}" ).format(
        sql.Identifier(dbname) )
    )                
    cur.close()
    
    cur = con.cursor()
    cur.execute(sql.SQL( "create database  {}" ).format(
        sql.Identifier(dbname) )
    )                
    cur.close()
    con.close()

    connect_str = "dbname='" + dbname + "' user='bkd' host='10.1.7.101' " + \
                  "password='444bkd444'"

    con2 = psycopg2.connect( host=dbhost, dbname=dbname,
                             user=dbuser, password=dbpass )
    
    con2.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
except Exception as e:
    print("Can't connect. Invalid dbname, user or password?")
    print(e)

with open("etc/bkd-v06.sql","r") as fh:
    q = ""
    
    for ln in fh:
        if ';' not in ln:
            q += ln.strip()
        else:
            q += ln.strip()
            try:
                cur = con2.cursor()
                #print(q);
                cur.execute(q)
                con2.commit()
                cur.close()
                #print("DONE")
            except Exception as e:
                print("error!!!")
                print(e)                
            q=""
con2.close()
    
