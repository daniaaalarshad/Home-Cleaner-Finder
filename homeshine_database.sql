--
-- PostgreSQL database dump
--

\restrict pZ8dAamYayDOmxp66wHg5sTbZgln3bokdX1FNIValjBDXQzNEHgA1nXLaFqXawr

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    customer_id character varying NOT NULL,
    cleaner_id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    address text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: cleaners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cleaners (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    name text NOT NULL,
    bio text NOT NULL,
    rate integer NOT NULL,
    city text NOT NULL,
    experience_years integer NOT NULL,
    image_url text,
    specialties text[],
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: cleaners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cleaners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cleaners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cleaners_id_seq OWNED BY public.cleaners.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    password character varying NOT NULL
);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: cleaners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners ALTER COLUMN id SET DEFAULT nextval('public.cleaners_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, customer_id, cleaner_id, date, status, address, notes, created_at) FROM stdin;
\.


--
-- Data for Name: cleaners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cleaners (id, user_id, name, bio, rate, city, experience_years, image_url, specialties, created_at) FROM stdin;
3	user_1	Alice Cleaner	Professional cleaner with 5 years experience. Specializing in deep cleaning and move-in/move-out services.	30	New York	5	/images/cleaner_1.png	{"Deep Cleaning",Move-in/out}	2026-01-28 11:33:03.422512
4	user_2	Bob Sparkle	I make your home sparkle! Eco-friendly products only. Certified green cleaning professional.	40	San Francisco	8	/images/cleaner_2.png	{Eco-friendly,"Window Cleaning"}	2026-01-28 11:33:03.429605
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
wTkQWw2-OsObWWDqQrWyoHp-mJhho5fb	{"cookie": {"path": "/", "secure": true, "expires": "2026-02-04T11:27:21.270Z", "httpOnly": true, "originalMaxAge": 604800000}}	2026-02-04 11:46:20
_SALcP4BtEArQ_kTz-mLeJP2Ifo078D2	{"cookie": {"path": "/", "secure": false, "expires": "2026-02-04T11:35:13.072Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "96b6cd46-eaa6-4523-b2c5-5aca0ae2996e"}}	2026-02-04 11:35:14
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, password) FROM stdin;
user_1	cleaner1@example.com	Alice	Cleaner	/images/cleaner_1.png	2026-01-28 11:33:03.360486	2026-01-28 11:33:03.360486	$2b$12$d.kXzlKdHBkbblngYf8zb.bP2sP4SJXZVY583xpQ9GkEX7pEhIcqW
user_2	cleaner2@example.com	Bob	Sparkle	/images/cleaner_2.png	2026-01-28 11:33:03.415623	2026-01-28 11:33:03.415623	$2b$12$d.kXzlKdHBkbblngYf8zb.bP2sP4SJXZVY583xpQ9GkEX7pEhIcqW
96b6cd46-eaa6-4523-b2c5-5aca0ae2996e	pbqrpy@test.com	Test	User	\N	2026-01-28 11:34:36.269013	2026-01-28 11:34:36.269013	$2b$12$HyqZ4bJgo4XGFOUoLiFD0.DVjBRU2axoQ4Gtucb4kJnDllEiYBJrm
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- Name: cleaners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cleaners_id_seq', 4, true);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: cleaners cleaners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_pkey PRIMARY KEY (id);


--
-- Name: cleaners cleaners_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_user_id_unique UNIQUE (user_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: bookings bookings_cleaner_id_cleaners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_cleaner_id_cleaners_id_fk FOREIGN KEY (cleaner_id) REFERENCES public.cleaners(id);


--
-- Name: bookings bookings_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: cleaners cleaners_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cleaners
    ADD CONSTRAINT cleaners_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict pZ8dAamYayDOmxp66wHg5sTbZgln3bokdX1FNIValjBDXQzNEHgA1nXLaFqXawr

