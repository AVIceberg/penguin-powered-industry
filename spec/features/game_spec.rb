require 'spec_helper'
require 'active_support/time'

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
    for i in 0..5
      find('#clicking-area').click
    end
    click_button('buy-labour-camp')
    @currentToys = find_by_id('toys')['outerHTML']
    expect(@currentToys != 0).to eq(true)
  end
end
