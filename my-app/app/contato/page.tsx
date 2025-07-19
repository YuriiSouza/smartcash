// pages/contato.tsx

import React from 'react';
import Head from 'next/head';
import ContactPage from '@/components/contats';
import { HeaderProducts } from '@/components/header-products';

const Contact = () => {
  return (
    <>
      <HeaderProducts />
      <ContactPage />
    </>
  );
};

export default Contact;