package edu.ucla.mbi.bkd.store;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.StringWriter;

import java.util.*;

import edu.ucla.mbi.dxf20.*;

import javax.xml.bind.JAXB;

import javax.persistence.*;

@Entity
@DiscriminatorValue("report")
public class ReportXref extends Xref{

    @ManyToOne
    @JoinColumn(name="fk_report", nullable=false)
    private Report report;
    
    public void setReport(Report report){
        this.report = report;
    }
    
    public Report getReport(){
        return this.report;
    }
   
}


