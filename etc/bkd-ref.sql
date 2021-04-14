CREATE TABLE type(
    pkey bigint DEFAULT nextval(('"type_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT type_fk PRIMARY KEY,
    ns character varying(32) DEFAULT ''::character varying NOT NULL,
    ac character varying(32) DEFAULT ''::character varying NOT NULL,
    name character varying(32) DEFAULT ''::character varying NOT NULL
);    

CREATE SEQUENCE type_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

insert into type (ns, ac, name) values ('dip','dip:0307','node');
insert into type (ns, ac, name) values ('dip','dip:0308','edge');
insert into type (ns, ac, name) values ('dip','dip:0309','experiment');
insert into type (ns, ac, name) values ('dip','dip:0310','evidence');
insert into type (ns, ac, name) values ('dip','dip:0311','source');
insert into type (ns, ac, name) values ('dip','dip:0312','producer');
insert into type (ns, ac, name) values ('','','taxon');
insert into type (ns, ac, name) values ('','','cross-reference');
-- insert into type (ns, ac, name) values ('psi-mi','MI:0326','protein');


CREATE TABLE cvterm(
    pkey bigint DEFAULT nextval(('"cvterm_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT cvterm_fk PRIMARY KEY,
    cvns character varying(32) DEFAULT ''::character varying NOT NULL,
    cvac character varying(32) DEFAULT ''::character varying NOT NULL,
    name character varying(1024) DEFAULT ''::character varying NOT NULL,
    parent bigint DEFAULT 0 NOT NULL,
    parent_rel DEFAULT 0 NOT NULL,
    definition text DEFAULT ''::text NOT NULL
);  

CREATE SEQUENCE cvterm_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX cvterm_01 ON cvterm USING btree (cvac);
CREATE INDEX cvterm_02 ON cvterm USING btree (cvns,cvac);
CREATE INDEX cvterm_03 ON cvterm USING btree (name);
CREATE INDEX cvterm_04 ON cvterm USING btree (parent,parent_rel);

insert into cvterm (cvns, cvac, name) values ('','','unspecified');


CREATE TABLE ident(
    pkey bigint DEFAULT nextval(('"ident_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT ident_fk PRIMARY KEY,
    pktype bigint DEFAULT 1 NOT NULL,
    prfix character varying(8) DEFAULT ''::character varying NOT NULL,
    ptfix character varying(4) DEFAULT ''::character varying NOT NULL,
    idmax integer DEFAULT 1 NOT NULL
);    

CREATE SEQUENCE ident_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

insert into ident ( pktype, prefix, pstfix, idmax) values( 1, 'DIP-','N',  63000);
insert into ident ( pktype, prefix, pstfix, idmax) values( 2, 'DIP-','E', 203000);
insert into ident ( pktype, prefix, pstfix, idmax) values( 3, 'DIP-','X', 271000);
insert into ident ( pktype, prefix, pstfix) values( 4, 'DIP-','V');
insert into ident ( pktype, prefix, pstfix, idmax) values( 5, 'DIP-','S',  19000);
insert into ident ( pktype, prefix, pstfix) values( 6, 'DIP-','P');

CREATE TABLE node ( -- protein/transcript/gene
    pkey bigint DEFAULT nextval(('"node_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT node_fk PRIMARY KEY,
    pktype bigint DEFAULT 1 NOT NULL,   -- node
    pktaxon bigint DEFAULT 1 NOT NULL,  -- unspecified taxon,
    pkdb character varying(32) DEFAULT ''::character varying NOT NULL,       
    dip character varying(32) DEFAULT ''::character varying NOT NULL,       
    uprot character varying(32) DEFAULT ''::character varying NOT NULL,
    rfseq character varying(32) DEFAULT ''::character varying NOT NULL,
    genid character varying(32) DEFAULT ''::character varying NOT NULL,
    label character varying(32) DEFAULT ''::character varying NOT NULL,         
    name text DEFAULT ''::text NOT NULL,
    sequence text DEFAULT ''::text NOT NULL,    
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE SEQUENCE node_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX node_01 ON node USING btree (pktype);
CREATE INDEX node_02 ON node USING btree (pktaxon);
CREATE INDEX node_03 ON node USING btree (dip);
CREATE INDEX node_04 ON node USING btree (rfseq);
CREATE INDEX node_05 ON node USING btree (label);
CREATE INDEX node_06 ON node USING btree (uprot);
CREATE INDEX node_07 ON node USING btree (genid);
CREATE INDEX node_09 ON node USING btree (t_cr);
CREATE INDEX node_10 ON node USING btree (t_mod);

CREATE TABLE xref (
    pkey bigint DEFAULT nextval(('"xref_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_fk PRIMARY KEY,
    dtype VARCHAR(31) NOT NULL ,
    nowner_pkey bigint DEFAULT NULL,
    eowner_pkey bigint DEFAULT NULL,
    xowner_pkey bigint DEFAULT NULL,
    vowner_pkey bigint DEFAULT NULL,
    powner_pkey bigint DEFAULT NULL,
    sowner_pkey bigint DEFAULT NULL,
    pktype bigint DEFAULT 0 NOT NULL,
    ns character varying(32) DEFAULT ''::character varying NOT NULL,
    ac character varying(32) DEFAULT ''::character varying NOT NULL
);

CREATE SEQUENCE xref_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX xref_01 ON xref USING btree (ac);
CREATE INDEX xref_02 ON xref USING btree (ac, ns);
CREATE INDEX xref_03 ON xref USING btree (nowner_pkey, ac);
CREATE INDEX xref_04 ON xref USING btree (eowner_pkey, ac);
CREATE INDEX xref_05 ON xref USING btree (xowner_pkey, ac);
CREATE INDEX xref_06 ON xref USING btree (vowner_pkey, ac);
CREATE INDEX xref_07 ON xref USING btree (powner_pkey, ac);
CREATE INDEX xref_08 ON xref USING btree (sowner_pkey, ac);
CREATE INDEX xref_09 ON xref USING btree (ns,pktype);
CREATE INDEX xref_10 ON xref USING btree (dtype);

CREATE TABLE taxon (
    pkey bigint DEFAULT nextval(('"taxon_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT taxon_fk PRIMARY KEY,
    pktype bigint DEFAULT 6 NOT NULL,    
    taxid integer DEFAULT 0 NOT NULL,
    sciname character varying(64) DEFAULT ''::character varying NOT NULL,
    comname text DEFAULT ''::text NOT NULL 
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


CREATE TABLE source (
    pkey bigint DEFAULT nextval(('"source_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT source_fk PRIMARY KEY,
    pktype bigint DEFAULT 5 NOT NULL,   -- source
    dip integer DEFAULT 0 NOT NULL,       
    pmid character varying(32) DEFAULT ''::character varying NOT NULL,
    doi character varying(32) DEFAULT ''::character varying NOT NULL,
    issn character varying(32) DEFAULT ''::character varying NOT NULL,
    imexid character varying(32) DEFAULT ''::character varying NOT NULL,
    authors text DEFAULT ''::text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    journal text DEFAULT ''::text NOT NULL,
    nlmid character varying(32) DEFAULT ''::character varying NOT NULL,
    volume character varying(32) DEFAULT ''::character varying NOT NULL,
    issue character varying(32) DEFAULT ''::character varying NOT NULL,
    page character varying(32) DEFAULT ''::character varying NOT NULL,
    year character varying(32) DEFAULT ''::character varying NOT NULL,
    abstract text DEFAULT ''::text NOT NULL,
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_imex_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_imex_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
    );

CREATE SEQUENCE source_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

insert into source (authors, title) values ('unspecified','unspecified');

CREATE INDEX source_01 ON source USING btree (pmid);
CREATE INDEX source_02 ON source USING btree (doi);
CREATE INDEX source_03 ON source USING btree (imexid);
CREATE INDEX source_04 ON source USING btree (dip);
CREATE INDEX source_05 ON source USING btree (journal,year);
CREATE INDEX source_06 ON source USING btree (issn, year);
CREATE INDEX source_07 ON source USING btree (nlmid,year);
CREATE INDEX source_08 ON source USING btree (year);
CREATE INDEX source_09 ON source USING btree (status);
CREATE INDEX source_10 ON source USING btree (t_cr);
CREATE INDEX source_11 ON source USING btree (t_mod);
CREATE INDEX source_12 ON source USING btree (t_imex_cr);
CREATE INDEX source_13 ON source USING btree (t_imex_mod);


CREATE TABLE imex (
    pkey bigint DEFAULT nextval(('"imex_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT imex_fk PRIMARY KEY,
    pktype bigint DEFAULT 5 NOT NULL,   -- imex
    imexid character varying(32) DEFAULT ''::character varying NOT NULL,
    mif254 text DEFAULT ''::text,
    mif300 text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
    );

CREATE SEQUENCE imex_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX imex_01 ON imex USING btree (imexid);
CREATE INDEX imex_02 ON imex USING btree (t_cr);
CREATE INDEX imex_03 ON imex USING btree (t_mod);
CREATE INDEX imex_04 ON imex USING btree (status);

CREATE TABLE experiment (
    pkey bigint DEFAULT nextval(('"expt_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT experiment_fk PRIMARY KEY,
    pktype bigint DEFAULT 5 NOT NULL,   -- imex
    dip integer DEFAULT 0 NOT NULL,
    imexid character varying(32) DEFAULT ''::character varying NOT NULL,    
    pksource bigint DEFAULT 0 NOT NULL,    
    pkimex bigint DEFAULT 0,
    pkhost bigint DEFAULT 0 NOT NULL,
    pkresult bigint DEFAULT 0 NOT NULL,
    pkmethod bigint DEFAULT 0 NOT NULL,
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
    );

CREATE SEQUENCE expt_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX expt_01 ON experiment USING btree (dip);
CREATE INDEX expt_02 ON experiment USING btree (pkhost);
CREATE INDEX expt_03 ON experiment USING btree (pkmethod);
CREATE INDEX expt_04 ON experiment USING btree (pkresult);
CREATE INDEX expt_05 ON experiment USING btree (pksource);
CREATE INDEX expt_06 ON experiment USING btree (pkimex);
CREATE INDEX expt_07 ON experiment USING btree (status);
CREATE INDEX expt_08 ON experiment USING btree (t_cr);
CREATE INDEX expt_09 ON experiment USING btree (t_mod);

CREATE TABLE experiment_node (
    experiment_pkey bigint NOT NULL , 
    nodes_pkey bigint NOT NULL
    );

CREATE INDEX en_01 ON experiment_node USING btree (experiment_pkey,nodes_pkey);

ALTER TABLE experiment_node
    ADD CONSTRAINT FKm7j0bnabh2yr0pe99il1d066u
    FOREIGN KEY (experiment_pkey) REFERENCES experiment;

ALTER TABLE experiment_node
    ADD CONSTRAINT FKba7rc9qe2vh44u93u0p2auwti
    FOREIGN KEY (nodes_pkey) REFERENCES node;


CREATE TABLE experiment_producer (
    experiment_pkey bigint NOT NULL , 
    prods_pkey bigint NOT NULL
    );

CREATE INDEX ep_01 ON experiment_producer USING btree (experiment_pkey,prods_pkey);

CREATE TABLE evidence (
    pkey bigint DEFAULT nextval(('"evid_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT evidence_fk PRIMARY KEY,
    pktype bigint DEFAULT 5 NOT NULL,   -- imex
    dip integer DEFAULT 0 NOT NULL,
    pkevidmeth bigint DEFAULT 0 NOT NULL,
    pkresult bigint DEFAULT 0 NOT NULL,
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
    );

CREATE SEQUENCE evid_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX evid_01 ON evidence USING btree (dip);
CREATE INDEX evid_02 ON evidence USING btree (pkevidmeth);
CREATE INDEX evid_03 ON evidence USING btree (pkresult);
CREATE INDEX evid_04 ON evidence USING btree (status);
CREATE INDEX evid_05 ON evidence USING btree (t_cr);
CREATE INDEX evid_06 ON evidence USING btree (t_mod);

CREATE TABLE evidence_experiment (
    evidence_pkey bigint NOT NULL , 
    exptset_pkey bigint NOT NULL
    );

CREATE INDEX ee_01 ON evidence_experiment USING btree (evidence_pkey,exptset_pkey);
       
ALTER TABLE evidence_experiment
    ADD CONSTRAINT FKm7j0bnabh2yr0pe99il1d066g
    FOREIGN KEY (evidence_pkey) REFERENCES evidence;

ALTER TABLE evidence_experiment
    ADD CONSTRAINT FKba7rc9qe2vh44u93u0p2auwtj
    FOREIGN KEY (exptset_pkey) REFERENCES experiment;

CREATE TABLE edge (
    pkey bigint DEFAULT nextval(('"edge_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT edge_fk PRIMARY KEY,
    pktype bigint DEFAULT 5 NOT NULL,   -- imex
    dip integer DEFAULT 0 NOT NULL,
    pkedgetype bigint DEFAULT 0 NOT NULL,
    label character varying(32) DEFAULT ''::character varying NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    nodehash character varying(64) DEFAULT ''::character varying NOT NULL,
    core boolean DEFAULT false NOT NULL,
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
    );

CREATE SEQUENCE edge_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX edge_01 ON edge USING btree (dip);
CREATE INDEX edge_02 ON edge USING btree (pkedgetype);
CREATE INDEX edge_03 ON edge USING btree (core);
CREATE INDEX edge_04 ON edge USING btree (status);
CREATE INDEX edge_05 ON edge USING btree (t_cr);
CREATE INDEX edge_06 ON edge USING btree (t_mod);
CREATE INDEX edge_07 ON edge USING btree (nodehash);

CREATE TABLE edge_evidence (
    evidlist_pkey bigint NOT NULL , 
    edge_pkey bigint NOT NULL
    );

CREATE INDEX le_01 ON edge_evidence USING btree (evidlist_pkey,edge_pkey);

ALTER TABLE edge_evidence
    ADD CONSTRAINT FKm7j0bnabh2yr0pe99il1d077u
    FOREIGN KEY (evidlist_pkey) REFERENCES evidence;

ALTER TABLE edge_evidence
    ADD CONSTRAINT FKba7rc9qe2vh44u93u0p2au99j
    FOREIGN KEY (edge_pkey) REFERENCES edge;

CREATE TABLE edge_node (
    nodelist_pkey bigint NOT NULL , 
    edge_pkey bigint NOT NULL
    );
    
CREATE INDEX ln_01 ON edge_node USING btree (nodelist_pkey,edge_pkey);

ALTER TABLE edge_node
    ADD CONSTRAINT FKm7j0bnabh2yr0pe99il1d088u
    FOREIGN KEY (nodelist_pkey) REFERENCES node;

ALTER TABLE edge_node
    ADD CONSTRAINT FKba7rc9qe2vh44u93u0p2au99j
    FOREIGN KEY (edge_pkey) REFERENCES edge;

CREATE TABLE attachment (
    pkey bigint DEFAULT nextval(('"attach_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT attachment_fk PRIMARY KEY,
    pktype bigint DEFAULT 5 NOT NULL,   
    pkexparent bigint DEFAULT 0 NOT NULL, 
    ns character varying(16) DEFAULT ''::character varying NOT NULL,
    ac character varying(16) DEFAULT ''::character varying NOT NULL,
    value text DEFAULT ''::text,
    comment text DEFAULT ''::text,
    status character varying(16) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
   );

CREATE SEQUENCE attach_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX attach_01 ON attachment USING btree (pkexparent);
CREATE INDEX attach_02 ON attachment USING btree (pktype);
CREATE INDEX attach_03 ON attachment USING btree (ns,ac);
CREATE INDEX attach_04 ON attachment USING btree (status);
CREATE INDEX attach_05 ON attachment USING btree (t_cr);
CREATE INDEX attach_06 ON attachment USING btree (t_mod);

CREATE TABLE producer (
    pkey bigint DEFAULT nextval(('"prod_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT prod_fk PRIMARY KEY,
    pktype bigint DEFAULT 5 NOT NULL,
    dip integer DEFAULT 0 NOT NULL, 
    label character varying(32) DEFAULT ''::character varying NOT NULL,
    name character varying(128) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
   );


CREATE SEQUENCE prod_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE MAXVALUE 2147483647 CACHE 1;
    

CREATE TABLE producer_xrefs (
    producer_pkey bigint NOT NULL , 
    xrefs_pkey bigint NOT NULL
    );

CREATE INDEX px_01 ON producer_xrefs USING btree (producer_pkey,xrefs_pkey);

