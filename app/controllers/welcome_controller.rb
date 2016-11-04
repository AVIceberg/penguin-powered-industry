class WelcomeController < ApplicationController

  # GET /welcome
  def index
    if !!session[:id]
      redirect_to User.find(session[:id])
    end
  end

end
