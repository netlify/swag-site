import React, { Fragment } from 'react';
import { graphql, Link } from 'gatsby';
import Layout from '../components/layout';
import ProductTypeLabel from '../components/product-type-label';
import Cart from '../assets/cart.svg';
import { useCart } from '../context/cart-context';
import styles from '../styles/product-details.module.css';
import SEO from '../components/seo';
import {
  SizingChartShirts,
  SizingChartJammies,
} from '../components/sizing-charts';
import { PasswordLock } from '../components/password-lock';
import ProductPageThumbnail from '../components/product-page-thumbnail.js';

import SelectArrow from '../components/select-arrow';
import { useAccess } from '../context/access-context';

export const query = graphql`
  query($productID: String) {
    shopifyCollection(products: { elemMatch: { id: { eq: $productID } } }) {
      handle
    }
    shopifyProduct(id: { eq: $productID }) {
      id
      title
      description
      images {
        localFile {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
      metafields {
        value
        key
      }
      variants {
        shopifyId
        availableForSale
        priceV2 {
          amount
          currencyCode
        }
        compareAtPriceV2 {
          amount
        }
        title
      }
      productType
    }
  }
`;

const formatPrice = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const Product = ({ product }) => {
  const { addItemToCart } = useCart();
  const needsSizing = product.variants.length > 1;

  const firstVariant = product.variants[0];
  const availableForSale = product.variants.find(
    (variant) => variant.availableForSale,
  );
  const currency = firstVariant.priceV2.currencyCode;
  const price = formatPrice(firstVariant.priceV2.amount);
  const compareAtPrice = firstVariant.compareAtPriceV2
    ? formatPrice(firstVariant.compareAtPriceV2.amount)
    : null;

  const metafields = product.metafields.filter((field) => {
    return field.key !== 'Sizing Chart';
  });

  const sizingChart = product.metafields.filter((field) => {
    return field.key === 'Sizing Chart';
  });

  const getSizingChart = (product) => {
    if (product === 'shirt') {
      return <SizingChartShirts />;
    }
    if (product === 'jammies') {
      return <SizingChartJammies />;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = new FormData(event.target);

    addItemToCart({
      variantId: data.get('variantId'),
      quantity: data.get('quantity'),
    });
  };

  const handleStockSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData(event.target);

    const email = data.get('email');
    const hubspotformid = data.get('hubspotformid');
    const hubspotutk = data.get('hubspotutk');
    const swag_product = data.get('swag_product');
    const swag_product_id = data.get('swag_product_id');

    console.log({
      email,
      hubspotformid,
      hubspotutk,
      swag_product,
      swag_product_id,
    });

    const response = await fetch(
      'https://www.netlify.com/.netlify/functions/hubspot',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          hubspotformid,
          hubspotutk,
          swag_product,
          swag_product_id,
        }),
      },
    ).then((res) => res.json());

    console.log(response);
  };

  return (
    <Fragment>
      <div className={`${styles.details} ${styles.detailsProduct}`}>
        <div className={styles.productDetailsContentContainer}>
          <h1 className={styles.heading}>{product.title}</h1>
          <p className={styles.price}>
            {compareAtPrice ? (
              <span>
                {currency} {price}
                <del className={styles.priceOnSale}>{compareAtPrice}</del>
              </span>
            ) : (
              <span>
                {currency} {price}
              </span>
            )}
          </p>
          <p className={styles.description}>{product.description}</p>
          {metafields.length > 0 ? (
            <details className={styles.metafields}>
              <summary>Product details</summary>
              <dl>
                {metafields.map((metafield) => {
                  return (
                    <Fragment key={metafield.key}>
                      <dt>{metafield.key}:</dt>
                      <dd>{metafield.value}</dd>
                    </Fragment>
                  );
                })}
              </dl>
            </details>
          ) : (
            ' '
          )}

          <form
            onSubmit={handleSubmit}
            className={`${styles.form} ${
              needsSizing ? styles.needsSizing : ''
            }`}
          >
            {needsSizing ? (
              <div className={styles.formRow}>
                <label htmlFor="variantId">Size</label>
                <select
                  name="variantId"
                  id="variantId"
                  className={styles.select}
                >
                  {product.variants
                    .filter((v) => v.availableForSale)
                    .map(({ shopifyId, title }) => (
                      <option key={shopifyId} value={shopifyId}>
                        {title}
                      </option>
                    ))}
                </select>
                <SelectArrow />
              </div>
            ) : (
              <input
                type="hidden"
                name="variantId"
                value={product.variants[0].shopifyId}
              />
            )}

            {availableForSale ? (
              <Fragment>
                <div className={styles.formRow}>
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    name="quantity"
                    id="quantity"
                    type="number"
                    min={1}
                    defaultValue={1}
                    className={styles.quantity}
                  />
                </div>

                <button type="submit" className={styles.button}>
                  <img src={Cart} alt="" className={styles.icon} />
                  Add to Cart
                </button>
              </Fragment>
            ) : (
              <div className={styles.outOfStock}>Out of stock</div>
            )}
          </form>

          <Link
            to={`/pages/shipping-and-return-policy`}
            className={styles.shippingAndReturnsPolicy}
          >
            Shipping and returns policy
          </Link>
        </div>
        <div className={styles.productDetailsImageContainer}>
          {product.productType && (
            <ProductTypeLabel
              type={product.productType}
              className={styles.productDetailsProductType}
            />
          )}
          <ProductPageThumbnail images={product.images} />
        </div>
      </div>

      <div className={styles.details}>
        <h2 className={`${styles.heading} ${styles.stockHeading}`}>
          Get notified about new and restocked items!
        </h2>

        <form method="POST" onSubmit={handleStockSubmit}>
          <input
            type="hidden"
            name="hubspotformid"
            value="cc1a422f-7b03-46ca-9653-9d346c98b8c0"
          />
          <input type="hidden" name="hubspotutk" value="" />
          <input type="hidden" name="swag_product" value={product.title} />
          <input type="hidden" name="swag_product_id" value={product.id} />
          <div className={styles.formRow}>
            <label htmlFor="email">Email Address</label>
            <input
              className={styles.email}
              id="email"
              name="email"
              type="email"
              required
            />
          </div>
          <div className={`${styles.formRow} ${styles.stockSubmit}`}>
            <button type="submit" className={styles.button}>
              Sign Up
            </button>
          </div>
        </form>
      </div>

      {sizingChart.length > 0 ? (
        <div className={styles.details}>
          <h2 className={styles.heading}>Sizing chart</h2>
          {getSizingChart(sizingChart[0].value)}
        </div>
      ) : (
        ' '
      )}
    </Fragment>
  );
};

const ProductPage = ({ data }) => {
  const { access, updateAccess } = useAccess();
  const collection = data.shopifyCollection.handle;
  const product = data.shopifyProduct;

  // TODO centralize which collections are exclusive
  const isProtectedCollection = ['netlify-exclusive'].includes(collection);

  return (
    <Layout>
      {!isProtectedCollection || access ? (
        <Fragment>
          <SEO metadata={{ summary: 'summary', ...product }} />
          <Product product={product} />
        </Fragment>
      ) : (
        <PasswordLock handleCorrectPassword={() => updateAccess(true)} />
      )}
    </Layout>
  );
};

export default ProductPage;
