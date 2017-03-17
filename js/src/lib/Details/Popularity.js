import React from 'react';

const Popularity = (
  { stargazers, downloads, humanDownloads, dependents, humanDependents },
) => (
  <article className="details-side--popularity">
    <h1>Popularity</h1>
    <dl>
      {stargazers &&
        <div className="d-flex flex-items-between w-100">
          <dt>GitHub stargazers</dt>
          <span className="dotted flex-grow" />
          <dd>{stargazers.toLocaleString()}</dd>
        </div>}
      {downloads &&
        humanDownloads &&
        <div className="d-flex flex-items-between w-100">
          <dt>Downloads in the last 30 days</dt>
          <span className="dotted flex-grow" />
          <dd title={downloads.toLocaleString()}>
            {humanDownloads}
          </dd>
        </div>}
      {dependents &&
        <div className="d-flex flex-items-between w-100">
          <dt>Dependents</dt>
          <span className="dotted flex-grow" />
          <dd title={dependents.toLocaleString()}>{humanDependents}</dd>
        </div>}
    </dl>
  </article>
);

export default Popularity;
