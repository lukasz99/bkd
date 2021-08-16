CREATE TABLE type(
    pkey bigint DEFAULT nextval(('"type_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT type_pk PRIMARY KEY,
    ns character varying(32) DEFAULT ''::character varying NOT NULL,
    ac character varying(32) DEFAULT ''::character varying NOT NULL,
    name character varying(32) DEFAULT ''::character varying NOT NULL
);    

CREATE SEQUENCE type_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

insert into type (ns, ac, name) values ('','','unspecified');   -- unspecified
insert into type (ns, ac, name) values ('dip','dip:0307','node');
insert into type (ns, ac, name) values ('dip','dip:0308','edge');
insert into type (ns, ac, name) values ('dip','dip:0309','experiment');
insert into type (ns, ac, name) values ('dip','dip:0310','inference');
insert into type (ns, ac, name) values ('dip','dip:0311','source');
insert into type (ns, ac, name) values ('dip','dip:0312','producer');

CREATE TABLE cvterm(
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

CREATE TABLE ident(
    pkey bigint DEFAULT nextval(('"ident_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT ident_pk PRIMARY KEY,
    name character varying(16)  DEFAULT ''::character varying NOT NULL,
    prfix character varying(8) DEFAULT ''::character varying NOT NULL,
    ptfix character varying(4) DEFAULT ''::character varying NOT NULL,
    idmax integer DEFAULT 1 NOT NULL
);    

CREATE SEQUENCE ident_pkey_seq START WITH 192 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

insert into ident ( pkey, name, prfix, ptfix, idmax) values( 1, 'node', 'CVDB','N', 1);  -- node
insert into ident ( pkey, name, prfix, ptfix, idmax) values( 2, 'protein', 'CVDB','PN', 1);  -- node:protein
insert into ident ( pkey, name, prfix, ptfix, idmax) values( 3, 'rna', 'CVDB','RN', 1);  -- node:rna
insert into ident ( pkey, name, prfix, ptfix, idmax) values( 4, 'gene', 'CVDB','GN', 1);  -- node:gene
insert into ident ( pkey, name, prfix, ptfix, idmax) values( 5, 'molecule','CVDB','MN', 1);  -- node:molecule

insert into ident ( pkey, name, prfix, ptfix, idmax) values(32, 'edge', 'CVDB','E', 1);  -- edge
insert into ident ( pkey, name, prfix, ptfix, idmax) values(33, 'molint', 'CVDB','ME', 1);  -- edge: molecualr interaction
insert into ident ( pkey, name, prfix, ptfix, idmax) values(34, 'genint', 'CVDB','GE', 1);  -- edge: genetic interaction
insert into ident ( pkey, name, prfix, ptfix, idmax) values(35, 'funlnk', 'CVDB','FE', 1);  -- edge: functional link

insert into ident ( pkey, name, prfix, ptfix, idmax) values(64, 'experiment', 'CVDB','X', 1);  -- experiment

insert into ident ( pkey, name, prfix, ptfix, idmax) values(96, 'inference', 'CVDB','I', 1);  -- inference 

insert into ident ( pkey, name, prfix, ptfix, idmax) values(128, 'source', 'CVDB','S', 1);  -- source

insert into ident ( pkey, name, prfix, ptfix, idmax) values(160, 'producer', 'CVDB','P', 1);  -- producer

CREATE TABLE node ( -- protein/transcript(mRNA)/gene/molecule/etc
    pkey bigint DEFAULT nextval(('"node_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT node_pk PRIMARY KEY,
    node_type character varying(32) DEFAULT ''::character varying,
    cvtype bigint DEFAULT 0 NOT NULL,   -- unspecified type
    taxon bigint DEFAULT 1 NOT NULL,  -- unspecified taxon,
    ndid bigint DEFAULT 0 NOT NULL,

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
CREATE INDEX node_01b ON node USING btree (node_type);
CREATE INDEX node_02  ON node USING btree (taxon);
CREATE INDEX node_03  ON node USING btree (ndid);
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

CREATE TABLE taxon (
    pkey bigint DEFAULT nextval(('"taxon_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT taxon_pk PRIMARY KEY,   
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

CREATE TABLE alias (
    pkey bigint DEFAULT nextval(('"alias_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT alias_pk PRIMARY KEY,   
    fkey bigint DEFAULT 0 NOT NULL,  -- foreign key
    alias character varying(64) DEFAULT ''::character varying NOT NULL
);

CREATE SEQUENCE alias_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX alias_01 ON alias USING btree (fkey,alias);
CREATE INDEX alias_02 ON alias USING btree (alias);

CREATE TABLE xref (
    pkey bigint DEFAULT nextval(('"xref_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_pk PRIMARY KEY,
    xref_type character varying(32) DEFAULT ''::character varying,  -- node/protein/rna/gene/...       
    fkey bigint DEFAULT 0 NOT NULL,   -- foreign key (parent)
    fk_cvtype bigint DEFAULT 0 NOT NULL, -- unspecified xref type	
    fk_source bigint DEFAULT 0 NOT NULL, -- unspecified xref source   
    ns character varying(8) DEFAULT ''::character varying NOT NULL,
    ac character varying(32) DEFAULT ''::character varying NOT NULL,
    url character varying(128) DEFAULT ''::character varying NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
    comment text DEFAULT ''::text NOT NULL
);

CREATE SEQUENCE xref_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

CREATE INDEX xref_01 ON xref USING btree (fkey,ns,ac);
CREATE INDEX xref_02 ON xref USING btree (xref_type,fk_cvtype);
CREATE INDEX xref_03 ON xref USING btree (ac,fk_cvtype);
CREATE INDEX xref_04 ON xref USING btree (fk_cvtype);
CREATE INDEX xref_05 ON xref USING btree (fk_source);

CREATE TABLE source (   -- person/publication/institution       
       pkey bigint DEFAULT nextval(('"source_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT source_pk PRIMARY KEY,                                                     
       source_type character varying(32) DEFAULT ''::character varying,                                                                                                
       fk_cvtype bigint DEFAULT 0 NOT NULL, -- unspecified source type                                                                                                 
       name character varying(256) DEFAULT ''::character varying NOT NULL,                                                                                             
       url character varying(128) DEFAULT ''::character varying NOT NULL,                                                                                              
       email character varying(128) DEFAULT ''::character varying NOT NULL, -- LS: added
                                                                                                                                                                       
       atitle character varying(256) DEFAULT ''::character varying NOT NULL,                                                                                           
       jtitle  character varying(64) DEFAULT ''::character varying NOT NULL,
       citation character varying(64) DEFAULT ''::character varying NOT NULL,
       abstract text DEFAULT ''::text NOT NULL,                                                                                                                        
       nlmid character varying(16) DEFAULT ''::character varying NOT NULL,                                                                                             
                                                                                                                                                                       
       orcid character varying(32) DEFAULT ''::character varying NOT NULL,   -- skips https://orcid.org/
       doi character varying(32) DEFAULT ''::character varying NOT NULL,     -- skips https://doi.org/
       pmid character varying(16) DEFAULT ''::character varying NOT NULL,

       comment text DEFAULT ''::text NOT NULL,                                                                                                                         
       t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,                                                                               
       t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);

CREATE SEQUENCE source_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;


CREATE INDEX source_01 ON source USING btree (source_type, fk_cvtype);
CREATE INDEX source_02 ON source USING btree (name);
CREATE INDEX source_03 ON source USING btree (url);
CREATE INDEX source_04 ON source USING btree (atitle);
CREATE INDEX source_05 ON source USING btree (jtitle);
CREATE INDEX source_06 ON source USING btree (nlmid);
CREATE INDEX source_07 ON source USING btree (orcid);
CREATE INDEX source_08 ON source USING btree (doi);
CREATE INDEX source_09 ON source USING btree (pmid);

--TABLE comment  -- 
--      t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,
--       t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,

--TABLE property: property/feature  --  

CREATE TABLE property (
    pkey bigint DEFAULT nextval(('"prop_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_pk PRIMARY KEY,
    prop_type character varying(32) DEFAULT ''::character varying,  -- nprop/nfeature...
    fkey bigint DEFAULT 0 NOT NULL,   -- foreign key (parent)
    fk_source bigint DEFAULT 0 NOT NULL,  -- unspecified property source       
    fk_cval bigint DEFAULT 0 NOT NULL,    -- cv value
    jval text DEFAULT ''::text NOT NULL,  -- json value
    comment text DEFAULT ''::text NOT NULL,                                                                                                                         
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,                                                                               
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);


CREATE TABLE range (
    pkey bigint DEFAULT nextval(('"range_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT xref_pk PRIMARY KEY,
    range_type character varying(32) DEFAULT ''::character varying,  -- nfrange/...       
    fkey bigint DEFAULT 0 NOT NULL,   -- foreign key (property)
    beg int DEFAULT 0 NOT NULL,
    fk_cvbeg bigint DEFAULT 0 NOT NULL, -- unspecified beg type
    end DEFAULT 0 NOT NULL,
    fk_cvend bigint DEFAULT 0 NOT NULL, -- unspecified end type
    sequence text DEFAULT ''::text NOT NULL,
    t_cr timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone,                                                                               
    t_mod timestamp with time zone DEFAULT ('now'::text)::timestamp without time zone
);


--TABLE evidence -- 



--TABLE experiemnt --

