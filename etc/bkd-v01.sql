CREATE TABLE type(
    pkey bigint DEFAULT nextval(('"type_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT type_fk PRIMARY KEY,
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
    pkey bigint DEFAULT nextval(('"cvterm_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT cvterm_fk PRIMARY KEY,
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
    pkey bigint DEFAULT nextval(('"ident_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT ident_fk PRIMARY KEY,
    name character varying(8)  DEFAULT ''::character varying NOT NULL,
    prfix character varying(8) DEFAULT ''::character varying NOT NULL,
    ptfix character varying(4) DEFAULT ''::character varying NOT NULL,
    idmax integer DEFAULT 1 NOT NULL
);    

CREATE SEQUENCE ident_pkey_seq START WITH 1 INCREMENT BY 1
    NO MINVALUE NO MAXVALUE CACHE 1;

insert into ident ( pktype, prfix, ptfix, idmax) values( 1, 'CVDB','N', 1);  -- node
insert into ident ( pktype, prfix, ptfix, idmax) values( 2, 'CVDB','E', 1);  -- edge
insert into ident ( pktype, prfix, ptfix, idmax) values( 3, 'CVDB','X', 1);  -- experiment
insert into ident ( pktype, prfix, ptfix, idmax) values( 4, 'CVDB','I', 1);  -- inference 
insert into ident ( pktype, prfix, ptfix, idmax) values( 5, 'CVDB','S', 1);  -- source
insert into ident ( pktype, prfix, ptfix, idmax) values( 6, 'CVDB','P', 1);  -- producer

CREATE TABLE node ( -- protein/transcript(mRNA)/gene
    pkey bigint DEFAULT nextval(('"node_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT node_fk PRIMARY KEY,    
    cvtype bigint DEFAULT 0 NOT NULL,   -- unspecified type
    taxon bigint DEFAULT 1 NOT NULL,  -- unspecified taxon,
    ndid bigint DEFAULT 0 NOT NULL,
    
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

CREATE INDEX node_01 ON node USING btree (cvtype);
CREATE INDEX node_02 ON node USING btree (pktaxon);
CREATE INDEX node_03 ON node USING btree (pkdb);
CREATE INDEX node_04 ON node USING btree (dip);
CREATE INDEX node_05 ON node USING btree (rfseq);
CREATE INDEX node_06 ON node USING btree (label);
CREATE INDEX node_07 ON node USING btree (uprot);
CREATE INDEX node_08 ON node USING btree (genid);
CREATE INDEX node_09 ON node USING btree (t_cr);
CREATE INDEX node_10 ON node USING btree (t_mod);
CREATE INDEX node_11 ON node USING btree (status);
CREATE INDEX node_12 ON node USING btree (t_cr);
CREATE INDEX node_13 ON node USING btree (t_mod);

CREATE TABLE taxon (
    pkey bigint DEFAULT nextval(('"taxon_pkey_seq"'::text)::regclass) NOT NULL CONSTRAINT taxon_fk PRIMARY KEY,   
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
