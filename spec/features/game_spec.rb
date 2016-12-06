require 'spec_helper'    @
require 'active_support/time'


#-------------------------------------------------------------------------------------------------------------------------------------------------
#                   README
#-------------------------------------------------------------------------------------------------------------------------------------------------
#A user with "nickname: maintest"  and  "password: tester" is required for these tests to work! Make sure to add such a user into the database
#before you start the tests! This user must also be an admin.
#-------------------------------------------------------------------------------------------------------------------------------------------------
#                   END
#-------------------------------------------------------------------------------------------------------------------------------------------------
# Note: All Jasmine tests are located under the javascripts file in gameSpec.js!

describe 'Game Tests' do
  it "Click Increments Successfully", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    @currentToys = find_by_id('toys')['outerHTML']
    find('#clicking-area').click
    @newToys = find_by_id('toys')['outerHTML']
    expect(@currentToys != @newToys).to eq(true)
  end

  it "Save Toys Preserved Through Pages", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    @currentToys = find_by_id('toys')['outerHTML']
    find('#clicking-area').click
    visit('/game')
    @currentToys = find_by_id('toys')['outerHTML']
    expect(@currentToys != @newToys).to eq(true)
  end

  it "Toys Save Every Two Minutes", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    @currentToys = find_by_id('toys')['outerHTML']
    find('#clicking-area').click
    sleep(2.minutes)
    visit('/game')
    @currentToys = find_by_id('toys')['outerHTML']
    expect(@currentToys != @newToys).to eq(true)
  end

  it "Seconds Increment", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    @curentSeconds = find('#seconds')['outerHTML'].to_i
  end

  it "Minutes roll over", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    @previousMinutes = find('#minutes')['outerHTML'].to_i
    @previousSeconds = find('#seconds')['outerHTML'].to_i
    sleep(120) # 60 seconds
    @currentMinutes = find('#minutes')['outerHTML'].to_i
    @currentSeconds = find('#seconds')['outerHTML'].to_i

    expect(@currentMinutes != @previousMinutes).to eq(true)
  end

  it "Toys decrement when purchased", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    for i in 0..100
      find('#clicking-area').click
    end
    click_button('buy-labour-camp')
    @currentToys = find_by_id('toys')['outerHTML']
    expect(@currentToys != 100).to eq(true)
  end

  it "Purchase occurs only when toys are sufficient", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    for i in 0..100
      find('#clicking-area').click
    end
    click_button('buy-labour-camp')
    @currentToys = find_by_id('toys')['outerHTML']
    expect(@currentToys != 0).to eq(true)
  end
end

describe 'Admin Tests' do
  it "Button adds successfully", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    @currentToys = find_by_id('toys')['outerHTML']
    click_button('admin-add')
    expect(@currentToys + 10000 == find_by_id('toys')['outerHTML'].to eq(true)
  end

  it "Time button subtracts a minute", :js => true do
    visit '/'
    fill_in 'nickname', :with => "maintest"
    fill_in 'password', :with => "tester"
    click_on 'Submit'
    visit('/game')
    @previousTime = find('#minutes')['outerHTML'].to_i
    click_button('admin-time')
    @currentTime = find('#minutes')['outerHTML'].to_i
    expect(@previousTime - 1 == currentTime).to eq(true)
  end
end
