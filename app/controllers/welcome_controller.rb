class WelcomeController < ApplicationController

  # GET /welcome
  def index
    if user_is_logged_in?
      redirect_to User.find(session[:id])
    end
  end

end
