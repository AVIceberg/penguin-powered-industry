class ApplicationController < ActionController::Base
  helper_method :user_is_logged_in?
  helper_method :logout
  helper_method :user_is_admin?

  # Removes cookies (resets session) from the user's browser
  def logout
    reset_session
    redirect_to url_for(:controller => :welcome, :action => :index), :notice => "You have successfully logged out."
  end

  #
  def user_is_logged_in?
    !!session[:id]
  end

  def user_is_admin?
    !!(User.find_by_id(session[:id]).admin == true)
  end

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  #protect_from_forgery with: :exception
  protect_from_forgery unless Rails.env.test?
end
