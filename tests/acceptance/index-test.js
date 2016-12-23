import { test } from 'qunit';
import moduleForAcceptance from 'ember-addon-review/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance: Index');

test('visiting /', function(assert) {
  server.logging=true;
  server.createList('category', 7);

  var addons = server.createList('addons', 4);

  var category = server.create('category',
    {
      name: 'Authentication',
      description: 'Addons for auth',
      addonCount: 4
    });

  category.update({ addonIds: addons.mapBy('id') });

  var addonA = server.create('addon');

  var categoryA = server.create('category',
    {
      name: 'Simple Auth',
      description: 'Simple Auth addons',
      addonCount: 1,
      parentId: category.id
    });

  categoryA.update({ addonIds: [addonA.id] });

  visit('/');

  andThen(function() {
    assert.exists('.test-category', 8, 'All categories should display');
    assert.contains('.test-category', 'Authentication (4)', 'Categories should list title and count of addons');
    assert.contains('.test-subcategory:eq(0)', 'Simple Auth (1)', 'Subcategories should display under category');
  });

  click('.test-category:contains(Authentication)');

  andThen(function() {
    assert.equal(currentURL(), '/categories/authentication', 'URL should use category name token');
    assert.contains('.test-category-header', 'Authentication', 'Header should display');
    assert.contains('.test-category-description', 'Addons for auth', 'Description should display');
    assert.exists('.test-addon-row', 4, 'All addons in category should display');
    assert.contains('.test-addon-table-count', 'Displaying 4 addons', 'Should show addon count');
  });

  click("a:contains('Simple Auth (1)')");

  andThen(function() {
    assert.equal(currentURL(), '/categories/simple-auth', 'URL should use category name token');
    assert.contains('.test-category-header', 'Simple Auth', 'Header should display');
    assert.contains('.test-category-description', 'Simple Auth addons', 'Description should display');
    assert.exists('.test-addon-row', 1, 'All addons in category should display');
    assert.contains('.test-parent-category-link', 'Authentication (4)', 'Should link to parent category');
    assert.contains('.test-addon-table-count', 'Displaying 1 addon', 'Should show addon count');
  });
});

testSearch('/', function(assert) {
  assert.exists('h1:contains(Top addons)');
});

testSearch('/not-found', function(assert) {
  assert.exists(':contains(Oops)');
});

testSearch('/model-not-found', function(assert) {
  assert.exists(':contains(Oops)');
});

testSearch('/lists/new-addons', function(assert) {
  assert.exists('h1:contains(New Addons)');
});

testSearch('/maintainers/test-master', function(assert) {
  assert.exists('h1:contains(test-master)');
});

testSearch('/categories/testing', function(assert) {
  assert.exists('h1:contains(Testing)');
});

testSearch('/addons/ember-a-thing', function(assert) {
  assert.exists('h1:contains(ember-a-thing)');
});

test('going to a maintainer from search results works', function(assert) {
  server.create('maintainer', {name: 'test-master' });

  visit('/?query=test');
  click('.maintainer-results a:contains(test-master)');

  andThen(function() {
    assert.visible('h1:contains(test-master)');
  });
});

test('going to an addon from search results works', function(assert) {
  server.create('addon', {name: 'ember-test', license: 'GPL' });

  visit('/?query=test');
  click('.addon-list a:contains(ember-test)');

  andThen(function() {
    assert.visible('h1:contains(ember-test)');
    assert.contains('.test-addon-license', 'GPL');
  });
});

test('going to a category from search results works', function(assert) {
  server.create('category', {name: 'Testing' });

  visit('/?query=test');
  click('.category-results a:contains(Testing)');

  andThen(function() {
    assert.visible('h1:contains(Testing)');
  });
});

test('Unknown routes are handled', function(assert) {
  visit('/bullshit');

  andThen(function() {
    assert.equal(currentPath(), 'not-found');
  });
});

function testSearch(url, assertForContentOnUrl) {
  test(`visiting ${url} with a query`, function(assert) {
    server.logging=true;
    server.create('addon', { name: 'ember-a-thing' });
    server.create('addon', { name: 'ember-test-me', description: 'A thin addon' });
    server.create('category', { name: 'Another thing' });
    server.create('category', { name: 'quietest' });
    server.create('category', { name: 'Testing' });
    server.create('maintainer', { name: 'test-master' });

    visit(`${url}?query=test`);

    andThen(function() {
      assert.equal(currentURL(), `${url}?query=test`);
      assert.contains('.test-result-info', 'Results for "test"');
      assert.exists('.addon-list li', 1, 'Only 1 addon result');
      assert.contains('.addon-list li', 'ember-test-me');
      assert.exists('.category-results li', 2, '2 matching categories');
      assert.exists('.maintainer-results li', 1, '1 matching maintainer');
      assert.equal(find('#search-input').val(), 'test', 'Query is in text box');
    });

    fillIn('#search-input', 'thin ');

    andThen(function() {
      assert.equal(currentURL(), `${url}?query=thin`);
      assert.contains('.test-result-info', 'Results for "thin"');
      assert.exists('.addon-list li', 2, '2 addon results');
      assert.contains('.addon-list li', 'ember-test-me');
      assert.contains('.addon-list li', 'ember-a-thing');
      assert.exists('.category-results li', 1, '1 matching category');
      assert.notExists('.maintainer-results', 'No matching maintainers');
      assert.equal(find('#search-input').val(), 'thin', 'Query is in text box');
    });

    click('.test-clear-search');

    andThen(function() {
      assert.equal(find('#search-input').val(), '', 'Query is now empty');
      assert.equal(currentURL(), url);
      assertForContentOnUrl(assert);
    });
  });
}
