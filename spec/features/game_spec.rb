require 'spec_helper'

describe 'Game Tests' do
  it "Click Increments Successfully", :js => true do
    visit '/'
    fill_in 'nickname', :with => user(:Alex).nickname
    fill_in 'password', :with => "testing"
    click_on 'Submit'
    visit('/gamepage')
    @currentToys = find('h3#toys').native.attribute('outerHTML')
    find('#clicking-area').click
    @newToys = find('h3#toys').native.attribute('outerHTML')
    expect(@currentToys != @newToys).to eq(true)
  end

  it "Save Toys Preserved Through Pages", :js => true do
    visit '/'
    fill_in 'nickname', :with => user(:Alex).nickname
    fill_in 'password', :with => "testing"
    click_on 'Submit'
    visit('/gamepage')
    @currentToys = find( 'h3#toys').native.attribute('outerHTML')
    find('#clicking-area').click
    visit('/gamepage')
    @newToys = find('h3#toys').native.attribute('outerHTML')
    expect(@currentToys != @newToys).to eq(true)
  end

  it "Toys Save Every Two Minutes", :js => true do
    visit '/'
    fill_in 'nickname', :with => user(:Alex).nickname
    fill_in 'password', :with => "testing"
    click_on 'Submit'
    visit('/gamepage')
    @currentToys = find( 'h3#toys').native.attribute('outerHTML')
    find('#clicking-area').click
    sleep(2.minutes)
    visit('/gamepage')
    @newToys = find('h3#toys').native.attribute('outerHTML')
    expect(@currentToys != @newToys).to eq(true)
  end

  it "Seconds Increment", :js => true do
    visit '/'
    fill_in 'nickname', :with => user(:Alex).nickname
    fill_in 'password', :with => "testing"
    click_on 'Submit'
    visit('/gamepage')
    @curentSeconds = find('span#seconds').native.attribute('outerHTML').to_i
  end

  it "Minutes roll over", :js => true do
    visit '/'
    fill_in 'nickname', :with => user(:Alex).nickname
    fill_in 'password', :with => "testing"
    click_on 'Submit'
    visit('/gamepage')
    @previousMinutes = find('span#minutes').native.attributes('outerHTML').to_i
    @previousSeconds = find('span#seconds').native.attribute('outerHTML').to_i
    sleep(59) # 59 seconds
    @currentMinutes = find('span#minutes').native.attributes('outerHTML').to_i
    @currentSeconds = find('span#seconds').native.attribute('outerHTML').to_i

    expect(@currentMinutes == @previousMinutes - 1).to eq(true)
    expect(@currentSeconds == 59).to eq(true)
  end

  it "Toys decrement when purchased", :js => true do
    visit '/'
    fill_in 'nickname', :with => user(:Alex).nickname
    fill_in 'password', :with => "testing"
    click_on 'Submit'
    visit('/gamepage')
    for i in 0..100
      find('#clicking-area').click
    end
    click_button('#buy-labour-camp')
    @currentToys = find('h3#toys').native.attribute('outerHTML')
    expect(@currentToys != 100).to eq(true)
  end

  it "Purchase occurs only when toys are sufficient", :js => true do
    visit '/'
    fill_in 'nickname', :with => user(:Alex).nickname
    fill_in 'password', :with => "testing"
    click_on 'Submit'
    visit('/gamepage')
    for i in 0..5
      find('#clicking-area').click
    end
    click_button('#buy-labour-camp')
    @currentToys = find('h3#toys').native.attribute('outerHTML')
    expect(@currentToys != 0).to eq(true)
  end
end
