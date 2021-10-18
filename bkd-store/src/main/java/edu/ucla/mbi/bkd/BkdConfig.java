package edu.ucla.mbi.bkd;

import java.util.*;

public class BkdConfig{
 
    private String prefix = "BKD";
    
    //public BkdConfig(){}
    
    public void setPrefix( String prefix ){
        this.prefix = prefix;
    }

    public String getPrefix(){
        return prefix;
    }

    List<String> attrAcList  = null;
    
    public void setStoredAttrAcList(List<String> aclist){
        this.attrAcList=aclist;        
    }

    public List<String> getStoredAttrAcList(){
        if( this.attrAcList == null )
            this.attrAcList = new ArrayList<String>();
        return this.attrAcList;        
    }

    List<String> aliasAcList = null;
    public void setStoredAliasAcList(List<String> aclist){
        this.aliasAcList=aclist;        
    }
    
    public List<String> getStoredAliasAcList(){
        if( this.aliasAcList == null )
            this.aliasAcList = new ArrayList<String>();
        return this.aliasAcList;        
    }        
}
