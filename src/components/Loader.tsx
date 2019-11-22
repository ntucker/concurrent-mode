import React from 'react';
import { Spinner } from './Spinner';

export const Loader = ({ text = 'Loading...' }) => (
  <div className="text-center mt-32 text-lg">
    <Spinner />
    <br /> {text}
  </div>
);
