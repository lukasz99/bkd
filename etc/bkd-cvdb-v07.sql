CREATE TABLE type (
    pkey bigint DEFAULT nextval(('"type_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT type_pk PRIMARY KEY,
    ns character varying(32) DEFAULT ''::character varying NOT NULL,
    ac character varying(32) DEFAULT ''::character varying NOT NULL,
    name character varying(32) DEFAULT ''::character varying NOT NULL
);    

CREATE SEQUENCE type_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

insert into type (ns, ac, name) values ('','','unspecified');
insert into type (ns, ac, name) values ('dip','dip:0307','node');
insert into type (ns, ac, name) values ('dip','dip:0308','edge');
insert into type (ns, ac, name) values ('dip','dip:0309','experiment');
insert into type (ns, ac, name) values ('dip','dip:0310','inference');
insert into type (ns, ac, name) values ('dip','dip:0311','source');
insert into type (ns, ac, name) values ('dip','dip:0312','producer');

CREATE TABLE cvterm (
    pkey bigint DEFAULT nextval(('"cvterm_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT cvterm_pk PRIMARY KEY,
    ns character varying(32) DEFAULT ''::character varying NOT NULL,
    ac character varying(32) DEFAULT ''::character varying NOT NULL,
    name character varying(1024) DEFAULT ''::character varying NOT NULL,
    parent bigint DEFAULT 0 NOT NULL,
    parent_rel bigint DEFAULT 0 NOT NULL,
    definition text DEFAULT ''::text NOT NULL
);  

CREATE SEQUENCE cvterm_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX cvterm_01 ON cvterm USING btree (ac);
CREATE INDEX cvterm_02 ON cvterm USING btree (ns,ac);
CREATE INDEX cvterm_03 ON cvterm USING btree (name);
CREATE INDEX cvterm_04 ON cvterm USING btree (parent,parent_rel);

insert into cvterm (ns, ac, name) values ('','','unspecified');
insert into cvterm (ns, ac, name) values ('psi-mi','MI:0848','taxon');
insert into cvterm (ns, ac, name) values ('psi-mi','MI:0326','protein');
insert into cvterm (ns, ac, name) values ('psi-mi','MI:0250','gene');
insert into cvterm (ns, ac, name) values ('psi-mi','MI:0324','mRNA');
insert into cvterm (ns, ac, name) values ('psi-mi','MI:0319','DNA');
insert into cvterm (ns, ac,name) values ('dxf','dxf:0096','channel-report');
insert into cvterm (ns, ac,name) values ('dxf','dxf:0097','transporter-report');
insert into cvterm (ns, ac,name) values ('dxf','dxf:0093','clinical-report');



CREATE TABLE cvtref (
    pkey bigint DEFAULT nextval(('"cvtref_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT cvtref_pk PRIMARY KEY,
    fk_cvreftype bigint DEFAULT 0 NOT NULL,
    ns character varying(32)  DEFAULT ''::character varying NOT NULL,
    ac character varying(32)  DEFAULT ''::character varying NOT NULL
);

CREATE SEQUENCE cvtref_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX cvtref_01 ON cvtref USING btree (ac);
CREATE INDEX cvtref_02 ON cvtref USING btree (ns, ac,fk_cvreftype);
CREATE INDEX cvtref_03 ON cvtref USING btree (ac,fk_cvreftype);

CREATE TABLE ident (
    pkey bigint DEFAULT nextval(('"ident_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT ident_pk PRIMARY KEY,
    name character varying(16)  DEFAULT ''::character varying NOT NULL,
    prfix character varying(8) DEFAULT ''::character varying NOT NULL,
    ptfix character varying(4) DEFAULT ''::character varying NOT NULL,
    idmax integer DEFAULT 1 NOT NULL
);    

CREATE SEQUENCE ident_pkey_seq START WITH 192 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

insert into ident ( pkey, name, prfix, ptfix, idmax) values( 1, 'node', 'CVDB','N', 1);  
insert into ident ( pkey, name, prfix, ptfix, idmax) values( 2, 'protein', 'CVDB','PN', 1); 
insert into ident ( pkey, name, prfix, ptfix, idmax) values( 3, 'rna', 'CVDB','RN', 1);  
insert into ident ( pkey, name, prfix, ptfix, idmax) values( 4, 'gene', 'CVDB','GN', 1);  
insert into ident ( pkey, name, prfix, ptfix, idmax) values( 5, 'molecule','CVDB','MN', 1); 

insert into ident ( pkey, name, prfix, ptfix, idmax) values(32, 'edge', 'CVDB','E', 1);  
insert into ident ( pkey, name, prfix, ptfix, idmax) values(33, 'molint', 'CVDB','ME', 1);
insert into ident ( pkey, name, prfix, ptfix, idmax) values(34, 'genint', 'CVDB','GE', 1);
insert into ident ( pkey, name, prfix, ptfix, idmax) values(35, 'funlnk', 'CVDB','FE', 1);
insert into ident ( pkey, name, prfix, ptfix, idmax) values(64, 'report', 'CVDB','R', 1);
insert into ident ( pkey, name, prfix, ptfix, idmax) values(65, 'experiment', 'CVDB','X', 1);
insert into ident ( pkey, name, prfix, ptfix, idmax) values(96, 'inference', 'CVDB','I', 1);

insert into ident ( pkey, name, prfix, ptfix, idmax) values(128, 'source', 'CVDB','S', 1);
insert into ident ( pkey, name, prfix, ptfix, idmax) values(160, 'producer', 'CVDB','P', 1);

CREATE TABLE node (
    pkey bigint DEFAULT nextval(('"node_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT node_pk PRIMARY KEY,
    sclass character varying(32) DEFAULT ''::character varying,
    cvtype bigint DEFAULT 0 NOT NULL,   
    taxon bigint DEFAULT 1 NOT NULL,  
    prefix character varying(8) DEFAULT ''::character varying,
    nacc int DEFAULT 0 NOT NULL,

    label character varying(32) DEFAULT ''::character varying NOT NULL,         
    name text DEFAULT ''::text NOT NULL,
    sequence text DEFAULT ''::text NOT NULL,    
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    version character varying(16) DEFAULT ''::character varying,	
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,

    dip character varying(32) DEFAULT ''::character varying,       
    upr character varying(32) DEFAULT ''::character varying,
    rsq_prot character varying(32) DEFAULT ''::character varying,
    rsq_rna  character varying(32) DEFAULT ''::character varying,
    rsq_gene character varying(32) DEFAULT ''::character varying,
    genid character varying(32) DEFAULT ''::character varying    
);

CREATE SEQUENCE node_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX node_01a ON node USING btree (cvtype);
CREATE INDEX node_01b ON node USING btree (sclass);
CREATE INDEX node_02  ON node USING btree (taxon);
CREATE INDEX node_03a ON node USING btree (prefix,nacc);
CREATE INDEX node_03b ON node USING btree (nacc);
CREATE INDEX node_04  ON node USING btree (dip);
CREATE INDEX node_05a ON node USING btree (rsq_prot);
CREATE INDEX node_05b ON node USING btree (rsq_rna);
CREATE INDEX node_05c ON node USING btree (rsq_gene);
CREATE INDEX node_06  ON node USING btree (label);
CREATE INDEX node_07  ON node USING btree (upr);
CREATE INDEX node_08  ON node USING btree (genid);
CREATE INDEX node_09  ON node USING btree (t_cr);
CREATE INDEX node_10  ON node USING btree (t_mod);
CREATE INDEX node_11  ON node USING btree (status);
CREATE INDEX node_12  ON node USING btree (t_cr);
CREATE INDEX node_13  ON node USING btree (t_mod);

CREATE TABLE edge (
    pkey bigint DEFAULT nextval(('"edge_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT edge_pk PRIMARY KEY,
    sclass character varying(32) DEFAULT ''::character varying,
    cvtype bigint DEFAULT 0 NOT NULL,   
    prefix character varying(8) DEFAULT ''::character varying,
    nacc int DEFAULT 0 NOT NULL,

    label character varying(32) DEFAULT ''::character varying NOT NULL,         
    name text DEFAULT ''::text NOT NULL,
    nhash char(64) DEFAULT ''::character NOT NULL,
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    version character varying(16) DEFAULT ''::character varying,	
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE SEQUENCE edge_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX edge_01a ON edge USING btree (cvtype);
CREATE INDEX edge_01b ON edge USING btree (sclass);
CREATE INDEX edge_03a ON edge USING btree (prefix,nacc);
CREATE INDEX edge_03b ON edge USING btree (nacc);
CREATE INDEX edge_03c ON edge USING btree (nhash);
CREATE INDEX edge_06  ON edge USING btree (label);
CREATE INDEX edge_09  ON edge USING btree (t_cr);
CREATE INDEX edge_10  ON edge USING btree (t_mod);
CREATE INDEX edge_11  ON edge USING btree (status);
CREATE INDEX edge_11a  ON edge USING btree (version);
CREATE INDEX edge_12  ON edge USING btree (t_cr);
CREATE INDEX edge_13  ON edge USING btree (t_mod);

CREATE TABLE lnode (
    pkey bigint DEFAULT nextval(('"lnode_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT lnode_pk PRIMARY KEY,
    fk_edge bigint DEFAULT 0 NOT NULL,
    fk_node bigint DEFAULT 0 NOT NULL,    
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE SEQUENCE lnode_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX lnode_01a ON lnode USING btree (fk_edge);
CREATE INDEX lnode_01b ON lnode USING btree (fk_node);
CREATE INDEX lnode_01c ON lnode USING btree (fk_node,fk_edge);
CREATE INDEX lnode_2   ON lnode USING btree (t_cr);
CREATE INDEX lnode_3   ON lnode USING btree (t_mod);

CREATE TABLE taxon (
    pkey bigint DEFAULT nextval(('"taxon_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT taxon_pk PRIMARY KEY,   
    taxid integer DEFAULT 0 NOT NULL,
    sciname character varying(64) DEFAULT ''::character varying NOT NULL,
    comname character varying(256) DEFAULT ''::character varying NOT NULL 
);

CREATE SEQUENCE taxon_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX taxon_01 ON taxon USING btree (taxid,sciname);
CREATE INDEX taxon_02 ON taxon USING btree (sciname);
CREATE INDEX taxon_03 ON taxon USING btree (comname);

insert into taxon (sciname,comname) values ('unspecified','unspecified');
insert into taxon (taxid, sciname,comname) values ('-1', 'in vitro','in vitro');
insert into taxon (taxid, sciname,comname) values ('-2', 'in vivo','in vivo');
insert into taxon (taxid, sciname,comname) values ('-3', 'in silico','in silico');

CREATE TABLE alias (
    pkey bigint DEFAULT nextval(('"alias_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT alias_pk PRIMARY KEY,   
    sclass character varying(32) DEFAULT ''::character varying,  
    fk_node bigint DEFAULT 0 NOT NULL,  
    fk_cvtype bigint DEFAULT 0 NOT NULL, 
    alias character varying(128) DEFAULT ''::character varying NOT NULL
);

CREATE SEQUENCE alias_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX alias_01 ON alias USING btree (fk_node, alias, fk_cvtype);
CREATE INDEX alias_02 ON alias USING btree (fk_cvtype, alias);
CREATE INDEX alias_03 ON alias USING btree (alias);
CREATE INDEX alias_04 ON alias USING btree (sclass);


CREATE TABLE attribute (
    pkey bigint DEFAULT nextval(('"attr_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT attr_pk PRIMARY KEY,   
    sclass character varying(32) DEFAULT ''::character varying,  
    fk_node bigint DEFAULT 0 NOT NULL,  
    fk_feat bigint DEFAULT 0 NOT NULL,  
    fk_cvtype bigint DEFAULT 0 NOT NULL,
    fk_source bigint DEFAULT 0 NOT NULL,
    value text DEFAULT ''::text NOT NULL
);

CREATE SEQUENCE attr_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX attr_01a ON attribute USING btree (fk_node, fk_cvtype);
CREATE INDEX attr_01b ON attribute USING btree (fk_feat, fk_cvtype);
CREATE INDEX attr_02  ON attribute USING btree (fk_cvtype);
CREATE INDEX attr_02a ON attribute USING btree (fk_source);
CREATE INDEX attr_04  ON attribute USING btree (sclass);

CREATE TABLE xref (
    pkey bigint DEFAULT nextval(('"xref_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_pk PRIMARY KEY,
    sclass character varying(32) DEFAULT ''::character varying, 
    fk_node bigint DEFAULT 0 NOT NULL,   
    fk_attr bigint DEFAULT 0 NOT NULL,
    fk_feature bigint DEFAULT 0 NOT NULL,
    fk_report bigint DEFAULT 0 NOT NULL, 
    fk_edge bigint DEFAULT 0 NOT NULL, 
    fk_cvtype bigint DEFAULT 0 NOT NULL, 
    fk_source bigint DEFAULT 0 NOT NULL, 
    ns character varying(32) DEFAULT ''::character varying NOT NULL,
    ac character varying(32) DEFAULT ''::character varying NOT NULL,
    url character varying(128) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    comment text DEFAULT ''::text NOT NULL
);

CREATE SEQUENCE xref_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX xref_01a ON xref USING btree (fk_node,ns,ac);
CREATE INDEX xref_01b ON xref USING btree (fk_feature,ns,ac);
CREATE INDEX xref_01c ON xref USING btree (fk_report,ns,ac);
CREATE INDEX xref_01d ON xref USING btree (fk_edge,ns,ac);
CREATE INDEX xref_01e ON xref USING btree (fk_attr,ns,ac);
CREATE INDEX xref_02  ON xref USING btree (sclass,fk_cvtype);
CREATE INDEX xref_03  ON xref USING btree (ac,fk_cvtype);
CREATE INDEX xref_04  ON xref USING btree (fk_cvtype);
CREATE INDEX xref_05  ON xref USING btree (fk_source);

CREATE TABLE source (   
       pkey bigint DEFAULT nextval(('"source_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT source_pk PRIMARY KEY,                                                     
       sclass character varying(32) DEFAULT ''::character varying,                                                                                                
       fk_cvtype bigint DEFAULT 0 NOT NULL, 
       name character varying(256) DEFAULT ''::character varying NOT NULL,                                                                                             
       url character varying(128) DEFAULT ''::character varying NOT NULL,                                                                                              
       email character varying(128) DEFAULT ''::character varying NOT NULL, 
                                                                                                                                                                       
       atitle character varying(256) DEFAULT ''::character varying NOT NULL,                                                                                           
       jtitle character varying(64) DEFAULT ''::character varying NOT NULL,
       citation character varying(64) DEFAULT ''::character varying NOT NULL,
       abstract text DEFAULT ''::text NOT NULL,                                                                                                                        
       nlmid character varying(16) DEFAULT ''::character varying NOT NULL,                                                                                             
                                                                                                                                                                       
       orcid character varying(32) DEFAULT ''::character varying NOT NULL,  
       doi character varying(32) DEFAULT ''::character varying NOT NULL,    
       pmid character varying(16) DEFAULT ''::character varying NOT NULL,

       ns character varying(32) DEFAULT ''::character varying NOT NULL,
       ac character varying(32) DEFAULT ''::character varying NOT NULL,

       comment text DEFAULT ''::text NOT NULL,                                                                                                                         
       t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,                                                                               
       t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE SEQUENCE source_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX source_01 ON source USING btree (sclass, fk_cvtype);
CREATE INDEX source_02 ON source USING btree (name);
CREATE INDEX source_03 ON source USING btree (url);
CREATE INDEX source_04 ON source USING btree (atitle);
CREATE INDEX source_05 ON source USING btree (jtitle);
CREATE INDEX source_06 ON source USING btree (nlmid);
CREATE INDEX source_07 ON source USING btree (orcid);
CREATE INDEX source_08 ON source USING btree (doi);
CREATE INDEX source_09 ON source USING btree (pmid);

CREATE TABLE report (
    pkey bigint DEFAULT nextval(('"rep_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT rep_pk PRIMARY KEY,
    sclass character varying(32) DEFAULT ''::character varying,
    prefix character varying(8) DEFAULT ''::character varying, 
    nacc int DEFAULT 0 NOT NULL, 
    
    cvtype bigint DEFAULT 0 NOT NULL,
    label character varying(32) DEFAULT ''::character varying NOT NULL,         
    name text DEFAULT ''::text NOT NULL,
    fk_node bigint DEFAULT 0 NOT NULL,
    fk_feat bigint DEFAULT 0 NOT NULL,
    fk_edge bigint DEFAULT 0 NOT NULL,     
    fk_type bigint DEFAULT 0 NOT NULL,
    fk_source bigint DEFAULT 0 NOT NULL,
    jval text DEFAULT ''::text NOT NULL,
    comment text DEFAULT ''::text NOT NULL,
    owner_id bigint DEFAULT 0 NOT NULL,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    version character varying(16) DEFAULT ''::character varying,            
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE SEQUENCE rep_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX rep_01  ON report USING btree (sclass, pkey);
CREATE INDEX rep_01a ON report USING btree (prefix,nacc);
CREATE INDEX rep_01b ON report USING btree (nacc);
CREATE INDEX rep_02a ON report USING btree (fk_node);
CREATE INDEX rep_02c ON report USING btree (fk_feat);
CREATE INDEX rep_02b ON report USING btree (fk_edge);
CREATE INDEX rep_03  ON report USING btree (fk_source);
CREATE INDEX rep_04  ON report USING btree (owner_id);
CREATE INDEX rep_05  ON report USING btree (status);
CREATE INDEX rep_06  ON report USING btree (t_cr);
CREATE INDEX rep_07  ON report USING btree (t_mod);

-- report access control

CREATE TABLE report_ausr (
       pkey int DEFAULT nextval(('"report_ausr_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT rep_ausr_pk PRIMARY KEY,
       report_id int DEFAULT 0 NOT NULL,
       usr_id int DEFAULT 0 NOT NULL
);

CREATE SEQUENCE report_ausr_pkey_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX report_ausr_pkey1 ON report_ausr USING btree (usr_id);
CREATE INDEX report_ausr_pkey2 ON report_ausr USING btree (report_id, usr_id);
CREATE INDEX report_ausr_pkey3 ON report_ausr USING btree (usr_id, report_id);


CREATE TABLE report_agrp (
       pkey int DEFAULT nextval(('"report_agrp_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT rep_agrp_pk PRIMARY KEY,
       report_id int DEFAULT 0 NOT NULL,
       grp_id int DEFAULT 0 NOT NULL
);

CREATE SEQUENCE report_agrp_pkey_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX report_agrp_pkey1 ON report_agrp USING btree (grp_id);
CREATE INDEX report_agrp_pkey2 ON report_agrp USING btree (report_id, grp_id);
CREATE INDEX report_agrp_pkey3 ON report_agrp USING btree (grp_id, report_id);

-- features

CREATE TABLE feature (
    pkey bigint DEFAULT nextval(('"feat_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT feat_pk PRIMARY KEY,
    sclass character varying(32) DEFAULT ''::character varying,
    fk_node bigint DEFAULT 0 NOT NULL,
    fk_type bigint DEFAULT 0 NOT NULL,
    label character varying(128) DEFAULT ''::character varying NOT NULL,         
    name text DEFAULT ''::text NOT NULL,
    fk_source bigint DEFAULT 0 NOT NULL,
    dataset character varying(32) DEFAULT ''::character varying,
    jval text DEFAULT ''::text NOT NULL,
    comment text DEFAULT ''::text NOT NULL,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    posidx int DEFAULT 0 NOT NULL,
    seqidx character varying(2) DEFAULT ''::character varying,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE SEQUENCE feat_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX feat_01 ON feature USING btree (sclass, pkey);
CREATE INDEX feat_02 ON feature USING btree (fk_node,pkey);
CREATE INDEX feat_03 ON feature USING btree (fk_type,fk_node,pkey);
CREATE INDEX feat_04 ON feature USING btree (fk_source,pkey);
CREATE INDEX feat_04a ON feature USING btree (dataset,pkey);
CREATE INDEX feat_06 ON feature USING btree (status);
CREATE INDEX feat_06a ON feature USING btree (posidx,dataset);
CREATE INDEX feat_06b ON feature USING btree (seqidx,dataset);
CREATE INDEX feat_07 ON feature USING btree (t_cr);
CREATE INDEX feat_08 ON feature USING btree (t_mod);

CREATE TABLE range (
    pkey bigint DEFAULT nextval(('"range_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT range_pk PRIMARY KEY,
    fk_feature bigint DEFAULT 0 NOT NULL,
    rstart int DEFAULT 0 NOT NULL,
    rstart2 int DEFAULT 0 NOT NULL,
    fk_cvstart bigint DEFAULT 0 NOT NULL,
    rstop int DEFAULT 0 NOT NULL,
    rstop2 int DEFAULT 0 NOT NULL,
    fk_cvstop bigint DEFAULT 0 NOT NULL, 
    sequence character varying(1024) DEFAULT ''::character varying,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,                                                                               
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE INDEX range_01 ON range USING btree (fk_feature);
CREATE INDEX range_02 ON range USING btree (rstart);
CREATE INDEX range_03 ON range USING btree (rstart2);
CREATE INDEX range_04 ON range USING btree (fk_cvstart);
CREATE INDEX range_05 ON range USING btree (rstop);
CREATE INDEX range_06 ON range USING btree (rstop2);
CREATE INDEX range_07 ON range USING btree (fk_cvstop);
CREATE INDEX range_08 ON range USING btree (sequence);
CREATE INDEX range_09 ON range USING btree (t_cr);
CREATE INDEX range_10 ON range USING btree (t_mod);

CREATE SEQUENCE role_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE role (
    pkey int DEFAULT nextval(('"role_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT role_pk PRIMARY KEY,
    name character varying(32) DEFAULT ''::character varying NOT NULL,
    comments character varying(1024) DEFAULT ''::character varying NOT NULL,
    grp_unique boolean DEFAULT false NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,                                                                               
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE INDEX role_01 ON role USING btree (name, pkey);
CREATE INDEX role_02 ON role USING btree (grp_unique, pkey);

CREATE SEQUENCE grp_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE grp (
    pkey int DEFAULT nextval(('"grp_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT ugp_pk PRIMARY KEY,
    name character varying(32) DEFAULT ''::character varying NOT NULL,
    label character varying(32) DEFAULT ''::character varying NOT NULL,
    comments character varying(1024) DEFAULT ''::character varying NOT NULL,
    contact_uid int,
    admin_uid int,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE INDEX grp_01 ON grp USING btree (name, pkey);
CREATE INDEX grp_02 ON grp USING btree (label, pkey);

CREATE SEQUENCE usr_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE usr (
    pkey int DEFAULT nextval(('"usr_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT usr_pk PRIMARY KEY,
    login character varying(32),
    pass character varying(32),  
    fname character varying(64),
    lname character varying(64),
    title character varying(64),
    affiliation character varying(128),
    email character varying(128),
    act_key character varying(64) not null default '',
    act_flag boolean not null default false,
    enable_flag boolean not null default true,
    time_cr timestamp not null default now(),
    prefs text not null default '',
    sha1pass character varying(128) default ''::character varying,
    password character varying(128) default ''::character varying,
    time_login timestamp default null
);

CREATE INDEX usr_idx1 ON usr (login);
CREATE INDEX usr_idx2 ON usr (fname);
CREATE INDEX usr_idx3 ON usr (lname);
CREATE INDEX usr_idx4 ON usr (affiliation);
CREATE INDEX usr_idx5 ON usr (email);

CREATE SEQUENCE grp_role_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE grp_role (
       pkey int DEFAULT nextval(('"grp_role_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT grp_role_pk PRIMARY KEY,
       grp_id int DEFAULT 0 NOT NULL,
       role_id int DEFAULT 0 NOT NULL
);

CREATE INDEX grp_role_pkey1 ON grp_role USING btree (grp_id);
CREATE INDEX grp_role_pkey2 ON grp_role USING btree (role_id, grp_id);
CREATE INDEX grp_role_pkey3 ON grp_role USING btree (grp_id, role_id);

CREATE SEQUENCE usr_role_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE usr_role (
       pkey int DEFAULT nextval(('"usr_role_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT usr_role_pk PRIMARY KEY,
       usr_id int DEFAULT 0 NOT NULL,
       role_id int DEFAULT 0 NOT NULL
);

CREATE INDEX usr_role_pkey1 ON usr_role USING btree (role_id);
CREATE INDEX usr_role_pkey2 ON usr_role USING btree (usr_id, role_id);
CREATE INDEX usr_role_pkey3 ON usr_role USING btree (role_id, usr_id);

CREATE SEQUENCE usr_grp_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE usr_grp (
       pkey int DEFAULT nextval(('"usr_grp_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT usr_grp_pk PRIMARY KEY,
       usr_id int DEFAULT 0 NOT NULL,
       grp_id int DEFAULT 0 NOT NULL
);

CREATE INDEX usr_grp_pkey1 ON usr_grp USING btree (grp_id);
CREATE INDEX usr_grp_pkey2 ON usr_grp USING btree (usr_id, grp_id);
CREATE INDEX usr_grp_pkey3 ON usr_grp USING btree (grp_id, usr_id);


CREATE SEQUENCE eorel_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE eorel (
    pkey int DEFAULT nextval(('"eorel_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT eorel_pk PRIMARY KEY,
    event character varying(32) not null default '',
    user_id integer not null default 0
);

CREATE INDEX eorel_1 on eorel (event);
CREATE INDEX eorel_2 on eorel (user_id);


