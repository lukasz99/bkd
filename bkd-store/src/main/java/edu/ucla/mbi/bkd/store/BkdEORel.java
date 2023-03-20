package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.xml.bind.JAXB;
import javax.persistence.*;

import edu.ucla.mbi.bkd.store.*;
import edu.ucla.mbi.bkd.access.*;


/* 
  <class name="edu.ucla.mbi.imex.central.dao.EORel" table="eorel" lazy="false">
    <id name="id" column="id" >
      <generator class="sequence">
        <param name="sequence_name">eorel_id_seq</param>
      </generator>
    </id>

    <property name="event" column="event" />

    <many-to-one name="observer" column="user_id"
               class="edu.ucla.mbi.imex.central.IcUser" />

  </class>
*/

@Entity
@Table(name = "eorel")
public class BkdEORel {

    @Id
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="eorel_pkey_seq")
    @SequenceGenerator( name="eorel_pkey_seq", sequenceName="eorel_pkey_seq",
                        allocationSize=1 )
    @Column(name = "pkey")    
    int pkey;

    @Column(name = "event") 
    String event = null;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    BkdUser observer = null;

    public BkdEORel(){};
    
    public BkdEORel( String event, BkdUser observer){
        this.event = event;
        this.observer = observer;
    }

   
    //--------------------------------------------------------------------------
    
    public void setId( int id ){
        this.pkey = id;
    }

    public int getId(){
        return pkey;
    }
    //--------------------------------------------------------------------------
    
    public void setObserver( BkdUser observer ){
        this.observer = observer;
    }

    public BkdUser getObserver(){
        return observer;
    }

    //--------------------------------------------------------------------------
    
    public void setEvent( String event ){
        this.event = event;
    }
    
    public String getEvent(){
        return event;
    }

}
