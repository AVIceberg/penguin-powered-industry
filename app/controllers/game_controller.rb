class GameController < ApplicationController

  def gamepage
    if user_is_logged_in?
      @user = User.find_by_id(session[:id])
      gon.strNickname = @user.nickname
      gon.iToys = @user.toys
    else
      redirect_to url_for(:controller => :welcome, :action => :index), :notice => "Please log in or sign up for an account."
    end
  end

  def save
    @user = User.find_by_id(session[:id])
    @user.toys = params[:toys]
    @user.save
    render js: ''
  end

end
