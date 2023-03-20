package edu.ucla.mbi.bkd.store;

import java.util.*;

public interface BkdAclAware {
    
    public boolean testAcl( Set<String> ownerMatch, 
                            Set<String> adminUserMatch, 
                            Set<String> adminGroupMatch );   
}
