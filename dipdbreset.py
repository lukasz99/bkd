#!/usr/bin/python3

import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

dbname= "cvdb_flip"

try:
    connect_str = "dbname='bkd_flip' user='bkd' host='10.1.7.101' " + \
                  "password='444bkd444'"
    
    con = psycopg2.connect(connect_str)
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

    con2 = psycopg2.connect(connect_str)
    con2.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
except Exception as e:
    print("Can't connect. Invalid dbname, user or password?")
    print(e)

with open("etc/bkd-v05.sql","r") as fh:
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
    
