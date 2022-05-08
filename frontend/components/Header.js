import React, { useState } from 'react';
import Head from 'next/head';

const Header = ({ title }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content="Aioquant Interface" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default Header;
