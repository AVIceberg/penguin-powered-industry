class ApplicationController < ActionController::Base
  helper_method :user_is_logged_in?
  helper_method :logout

  def logout
    reset_session
  end

  def user_is_logged_in?
    !!session[:id]
  end

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
end
