import React, { useState } from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import { HomeIntro } from '../components/home-intro';
import { CollectionListings } from '../components/collection-listings';
import { PasswordLock } from '../components/password-lock';
import SEO from '../components/seo';

export const query = graphql`
  {
    shopifyCollection(handle: { eq: "netlify-exclusive" }) {
      descriptionHtml
      handle
      title
      products {
        id
        title
        slug
        productType
        description
        variants {
          shopifyId
          title
          availableForSale
          image {
            localFile {
              childImageSharp {
                fluid(
                  maxWidth: 900
                  maxHeight: 900
                  fit: COVER
                  cropFocus: CENTER
                ) {
                  ...GatsbyImageSharpFluid
                }
              }
            }
          }
          priceV2 {
            amount
            currencyCode
          }
          sku
        }
      }
    }
    shopifyPage(handle: { eq: "netlify-exclusive-swag" }) {
      body
      title
    }
  }
`;

export default ({ data }) => {
  const [secret, setSecret] = useState();

  const { title, body } = data.shopifyPage;
  return (
    <Layout home>
      <SEO
        metadata={{
          title,
          description: 'Swag that’s only available to Netlify team members.',
        }}
      />
      {secret ? (
        <>
          <HomeIntro title={title} body={body} />
          <CollectionListings collection={data.shopifyCollection} />
        </>
      ) : (
        <PasswordLock handleCorrectPassword={() => setSecret(true)} />
      )}
    </Layout>
  );
};
